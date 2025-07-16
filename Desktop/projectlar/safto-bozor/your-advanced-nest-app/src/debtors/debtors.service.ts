import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debtor } from './entities/debtor.entity';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { DebtorResponseDto } from './dto/debtor-response.dto';
import { FilterDebtorDto } from './dto/filter-debtor.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class DebtorsService {
  constructor(
    @InjectRepository(Debtor)
    private debtorsRepository: Repository<Debtor>,
    private activityLogService: ActivityLogService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createDebtorDto: CreateDebtorDto, createdById: string): Promise<DebtorResponseDto> {
    const existingDebtor = await this.debtorsRepository.findOne({ where: { name: createDebtorDto.name } });
    if (existingDebtor) {
      throw new BadRequestException('Ushbu nomdagi qarzdor allaqachon mavjud.');
    }

    const newDebtor = this.debtorsRepository.create({ ...createDebtorDto, createdById });
    const savedDebtor = await this.debtorsRepository.save(newDebtor);

    await this.activityLogService.create({
      action: 'CREATE_DEBTOR',
      entityType: 'Debtor',
      entityId: savedDebtor.id,
      details: { name: savedDebtor.name, currentDebtAmount: savedDebtor.currentDebtAmount },
      createdById: createdById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', savedDebtor);
    return savedDebtor;
  }

  async findAll(filterDto: FilterDebtorDto): Promise<DebtorResponseDto[]> {
    const query = this.debtorsRepository.createQueryBuilder('debtor');

    if (filterDto.name) {
      query.andWhere('debtor.name ILIKE :name', { name: `%${filterDto.name}%` });
    }
    if (filterDto.contactInfo) {
      query.andWhere('debtor.contactInfo ILIKE :contactInfo', { contactInfo: `%${filterDto.contactInfo}%` });
    }
    if (filterDto.minDebtAmount) {
      query.andWhere('debtor.currentDebtAmount >= :minDebtAmount', { minDebtAmount: filterDto.minDebtAmount });
    }
    if (filterDto.maxDebtAmount) {
      query.andWhere('debtor.currentDebtAmount <= :maxDebtAmount', { maxDebtAmount: filterDto.maxDebtAmount });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<DebtorResponseDto> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }
    return debtor;
  }

  async update(id: string, updateDebtorDto: UpdateDebtorDto, updatedById: string): Promise<DebtorResponseDto> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }

    const oldDebtor = { ...debtor };

    Object.assign(debtor, updateDebtorDto);
    debtor.updatedById = updatedById;
    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'UPDATE_DEBTOR',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        oldDebtAmount: oldDebtor.currentDebtAmount,
        newDebtAmount: updatedDebtor.currentDebtAmount,
        oldDebtItems: oldDebtor.debtItems,
        newDebtItems: updatedDebtor.debtItems,
      },
      createdById: updatedById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }
    await this.debtorsRepository.remove(debtor);

    await this.activityLogService.create({
      action: 'DELETE_DEBTOR',
      entityType: 'Debtor',
      entityId: id,
      details: { name: debtor.name },
      createdById: removedById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', { id, deleted: true });
  }

  // Qarzdorlikni yangilash (sotuvdan kelib chiqqan)
  async updateDebtorDebt(
    debtorId: string,
    saleId: string,
    debtAmount: number,
    debtItems: { productId: string; productName: string; quantity: number; unit: string; pricePerUnit: number; totalItemAmount: number }[],
    userId: string,
  ): Promise<Debtor> {
    const debtor = await this.debtorsRepository.findOne({ where: { id: debtorId } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${debtorId} bo'lgan qarzdor topilmadi.`);
    }

    const oldDebtAmount = debtor.currentDebtAmount;
    const oldDebtItems = [...debtor.debtItems];

    debtor.currentDebtAmount = parseFloat((debtor.currentDebtAmount + debtAmount).toFixed(2));
    debtor.debtItems = [
      ...debtor.debtItems,
      ...debtItems.map(item => ({ ...item, saleId, debtDate: new Date() })),
    ];
    debtor.updatedById = userId;

    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'DEBTOR_DEBT_UPDATE',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        change: debtAmount,
        oldDebt: oldDebtAmount,
        newDebt: updatedDebtor.currentDebtAmount,
        saleId: saleId,
        addedItems: debtItems,
      },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }

  // Qarzdorlikni to'lash (qarzni kamaytirish)
  async payOffDebt(
    debtorId: string,
    amountPaid: number,
    userId: string,
  ): Promise<Debtor> {
    const debtor = await this.debtorsRepository.findOne({ where: { id: debtorId } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${debtorId} bo'lgan qarzdor topilmadi.`);
    }

    if (debtor.currentDebtAmount < amountPaid) {
      throw new BadRequestException(`Qarzdorlik ${debtor.currentDebtAmount} dan kam, ${amountPaid} to'lash mumkin emas.`);
    }

    const oldDebtAmount = debtor.currentDebtAmount;
    debtor.currentDebtAmount = parseFloat((debtor.currentDebtAmount - amountPaid).toFixed(2));
    debtor.updatedById = userId;

    // To'langan qarzga mos keladigan buyumlarni debtItems dan olib tashlash logikasi murakkabroq bo'lishi mumkin.
    // Hozircha faqat umumiy summani kamaytiramiz. Agar har bir item bo'yicha to'lov kerak bo'lsa, bu logikani kengaytirish kerak.
    // Misol uchun, eng eski qarz buyumlaridan boshlab to'lash mumkin.
    let remainingPayment = amountPaid;
    const newDebtItems = [];
    for (const item of debtor.debtItems) {
      if (remainingPayment <= 0) {
        newDebtItems.push(item);
        continue;
      }
      if (item.totalItemAmount <= remainingPayment) {
        remainingPayment -= item.totalItemAmount;
      } else {
        // Qisman to'lov
        const newItem = { ...item, totalItemAmount: item.totalItemAmount - remainingPayment };
        newDebtItems.push(newItem);
        remainingPayment = 0;
      }
    }
    debtor.debtItems = newDebtItems;


    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'DEBTOR_PAYMENT',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        amountPaid: amountPaid,
        oldDebt: oldDebtAmount,
        newDebt: updatedDebtor.currentDebtAmount,
      },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }
}
