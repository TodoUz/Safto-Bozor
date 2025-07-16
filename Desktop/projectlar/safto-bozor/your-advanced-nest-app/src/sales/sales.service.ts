import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { StockService } from '../stock/stock.service';
import { DebtorsService } from '../debtors/debtors.service';
import { MarketsService } from '../markets/markets.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway'; // EventsGateway ni import qilish

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private stockService: StockService,
    private debtorsService: DebtorsService,
    private marketsService: MarketsService,
    private activityLogService: ActivityLogService,
    private dataSource: DataSource, // Tranzaksiyalar uchun DataSource
    private eventsGateway: EventsGateway, // EventsGateway ni inject qilish
  ) {}

  async create(createSaleDto: CreateSaleDto, createdById: string): Promise<SaleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Mahsulotlar mavjudligini va miqdorini tekshirish, omborni yangilash
      for (const item of createSaleDto.productsSold) {
        const stockItem = await this.stockService.findOne(item.productId);
        if (!stockItem) {
          throw new NotFoundException(`Mahsulot IDsi ${item.productId} topilmadi.`);
        }
        if (stockItem.quantity < item.quantity) {
          throw new BadRequestException(`${stockItem.productName} mahsuloti uchun yetarli miqdor yo'q. Mavjud: ${stockItem.quantity}`);
        }
        // Ombor miqdorini kamaytirish
        await this.stockService.decreaseStockQuantity(item.productId, item.quantity, createdById);
      }

      // 2. Sotuvni yaratish
      const newSale = this.salesRepository.create({
        ...createSaleDto,
        createdById,
        amountPaid: createSaleDto.amountPaid || 0,
        debtAmount: createSaleDto.debtAmount || 0,
      });

      // Agar qarzdorlik bo'lsa, debtorId majburiy
      if (newSale.paymentMethod === 'debt' && !newSale.debtorId) {
        throw new BadRequestException('Qarzga sotilganda qarzdor IDsi majburiy.');
      }

      // Agar marketId berilgan bo'lsa, uning mavjudligini tekshirish
      if (newSale.marketId) {
        const market = await this.marketsService.findOne(newSale.marketId);
        if (!market) {
          throw new NotFoundException(`Bozor IDsi ${newSale.marketId} topilmadi.`);
        }
      }

      const savedSale = await queryRunner.manager.save(Sale, newSale);

      // 3. Agar to'lov usuli "debt" bo'lsa, qarzdorlikni yangilash
      if (savedSale.paymentMethod === 'debt' && savedSale.debtorId && savedSale.debtAmount > 0) {
        await this.debtorsService.updateDebtorDebt(
          savedSale.debtorId,
          savedSale.id,
          savedSale.debtAmount,
          savedSale.productsSold,
          createdById,
        );
      }

      // 4. Faoliyat jurnaliga yozish
      await this.activityLogService.create({
        action: 'CREATE_SALE',
        entityType: 'Sale',
        entityId: savedSale.id,
        details: {
          totalAmount: savedSale.totalAmount,
          paymentMethod: savedSale.paymentMethod,
          products: savedSale.productsSold.map(p => ({ name: p.productName, quantity: p.quantity })),
          debtorId: savedSale.debtorId,
        },
        createdById: createdById,
      });

      await queryRunner.commitTransaction();

      this.eventsGateway.emitToAll('newSale', savedSale); // WebSocket orqali yangi sotuvni yuborish
      return savedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni yaratishda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filterDto: FilterSaleDto): Promise<SaleResponseDto[]> {
    const query = this.salesRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.createdBy', 'createdBy')
      .leftJoinAndSelect('sale.updatedBy', 'updatedBy')
      .leftJoinAndSelect('sale.debtor', 'debtor')
      .leftJoinAndSelect('sale.market', 'market');

    if (filterDto.debtorId) {
      query.andWhere('sale.debtorId = :debtorId', { debtorId: filterDto.debtorId });
    }
    if (filterDto.marketId) {
      query.andWhere('sale.marketId = :marketId', { marketId: filterDto.marketId });
    }
    if (filterDto.isReturned !== undefined) {
      query.andWhere('sale.isReturned = :isReturned', { isReturned: filterDto.isReturned });
    }
    if (filterDto.paymentMethod) {
      query.andWhere('sale.paymentMethod = :paymentMethod', { paymentMethod: filterDto.paymentMethod });
    }
    if (filterDto.minTotalAmount) {
      query.andWhere('sale.totalAmount >= :minTotalAmount', { minTotalAmount: filterDto.minTotalAmount });
    }
    if (filterDto.maxTotalAmount) {
      query.andWhere('sale.totalAmount <= :maxTotalAmount', { maxTotalAmount: filterDto.maxTotalAmount });
    }
    if (filterDto.startDate) {
      query.andWhere('sale.saleDate >= :startDate', { startDate: new Date(filterDto.startDate) });
    }
    if (filterDto.endDate) {
      const endDate = new Date(filterDto.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.andWhere('sale.saleDate <= :endDate', { endDate: endDate });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'debtor', 'market'],
    });
    if (!sale) {
      throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
    }
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, updatedById: string): Promise<SaleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.salesRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
      }

      const oldSale = { ...sale }; // Eski ma'lumotlarni saqlash

      // Agar sotuv qaytarilsa (isReturned = true)
      if (updateSaleDto.isReturned === true && sale.isReturned === false) {
        // Omborga mahsulotlarni qaytarish
        for (const item of sale.productsSold) {
          await this.stockService.increaseStockQuantity(item.productId, item.quantity, updatedById);
        }
        // Agar qarzga sotilgan bo'lsa, qarzdorlikni kamaytirish
        if (sale.paymentMethod === 'debt' && sale.debtorId && sale.debtAmount > 0) {
          // Qarzni kamaytirish logikasi: bu yerda qarzni qaytarilgan summa bo'yicha kamaytirish kerak
          // Oddiy holatda, butun sotuv qaytarilsa, uning qarz summasini kamaytiramiz.
          await this.debtorsService.payOffDebt(sale.debtorId, sale.debtAmount, updatedById);
        }
        // Qaytarilgan sotuv uchun qarz summasini 0 ga tenglash
        sale.debtAmount = 0;
        sale.amountPaid = 0; // Qaytarilganda to'langan summa ham 0 bo'ladi deb faraz qilamiz
      } else if (updateSaleDto.isReturned === false && sale.isReturned === true) {
        // Agar qaytarilgan sotuv qayta tiklansa, bu holatni to'g'ri boshqarish kerak.
        // Hozircha bu holatga ruxsat bermaymiz yoki murakkabroq logikani talab qiladi.
        throw new BadRequestException('Qaytarilgan sotuvni qayta tiklash mumkin emas.');
      }

      // To'lov usuli o'zgarganda yoki qarz summasi yangilanganda
      if (updateSaleDto.paymentMethod && updateSaleDto.paymentMethod !== oldSale.paymentMethod) {
        if (oldSale.paymentMethod === 'debt' && oldSale.debtorId && oldSale.debtAmount > 0) {
          // Eski qarzni bekor qilish yoki to'lovga aylantirish
          // Bu yerda qarzni to'liq qoplash yoki qisman to'lash logikasi qo'shilishi mumkin
          // Hozircha faqat qarzni to'liq to'langan deb hisoblaymiz agar paymentMethod o'zgarsa
          await this.debtorsService.payOffDebt(oldSale.debtorId, oldSale.debtAmount, updatedById);
        }
        if (updateSaleDto.paymentMethod === 'debt' && updateSaleDto.debtorId && updateSaleDto.debtAmount > 0) {
          await this.debtorsService.updateDebtorDebt(
            updateSaleDto.debtorId,
            sale.id,
            updateSaleDto.debtAmount,
            updateSaleDto.productsSold || sale.productsSold, // Agar productsSold yangilanmasa, eskisini ishlatish
            updatedById,
          );
        }
      } else if (updateSaleDto.debtAmount !== undefined && updateSaleDto.debtAmount !== oldSale.debtAmount) {
        // Faqat qarz summasi yangilanganda (paymentMethod o'zgarmagan holda)
        if (sale.paymentMethod === 'debt' && sale.debtorId) {
          const debtDifference = updateSaleDto.debtAmount - oldSale.debtAmount;
          if (debtDifference > 0) {
            // Qarz oshirildi
            await this.debtorsService.updateDebtorDebt(
              sale.debtorId,
              sale.id,
              debtDifference,
              updateSaleDto.productsSold || sale.productsSold,
              updatedById,
            );
          } else if (debtDifference < 0) {
            // Qarz kamaytirildi (to'lov amalga oshirildi)
            await this.debtorsService.payOffDebt(sale.debtorId, Math.abs(debtDifference), updatedById);
          }
        }
      }


      Object.assign(sale, updateSaleDto);
      sale.updatedById = updatedById;
      const updatedSale = await queryRunner.manager.save(Sale, sale);

      // Faoliyat jurnaliga yozish
      await this.activityLogService.create({
        action: 'UPDATE_SALE',
        entityType: 'Sale',
        entityId: updatedSale.id,
        details: {
          oldTotalAmount: oldSale.totalAmount,
          newTotalAmount: updatedSale.totalAmount,
          oldPaymentMethod: oldSale.paymentMethod,
          newPaymentMethod: updatedSale.paymentMethod,
          oldIsReturned: oldSale.isReturned,
          newIsReturned: updatedSale.isReturned,
        },
        createdById: updatedById,
      });

      await queryRunner.commitTransaction();

      this.eventsGateway.emitToAll('saleUpdate', updatedSale); // WebSocket orqali yangilanish yuborish
      return updatedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni yangilashda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, removedById: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.salesRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
      }

      // Agar sotuv qaytarilmagan bo'lsa, omborga mahsulotlarni qaytarish
      if (!sale.isReturned) {
        for (const item of sale.productsSold) {
          await this.stockService.increaseStockQuantity(item.productId, item.quantity, removedById);
        }
      }

      // Agar qarzga sotilgan bo'lsa, qarzdorlikni kamaytirish
      if (sale.paymentMethod === 'debt' && sale.debtorId && sale.debtAmount > 0) {
        await this.debtorsService.payOffDebt(sale.debtorId, sale.debtAmount, removedById);
      }

      await queryRunner.manager.remove(Sale, sale);

      await this.activityLogService.create({
        action: 'DELETE_SALE',
        entityType: 'Sale',
        entityId: id,
        details: { totalAmount: sale.totalAmount, paymentMethod: sale.paymentMethod },
        createdById: removedById,
      });

      await queryRunner.commitTransaction();
      this.eventsGateway.emitToAll('saleUpdate', { id, deleted: true }); // WebSocket orqali o'chirilganini bildirish
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni o\'chirishda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
