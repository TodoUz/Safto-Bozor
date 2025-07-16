import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';
import { FilterStockDto } from './dto/filter-stock.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway'; // EventsGateway ni import qilish

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    private activityLogService: ActivityLogService,
    private eventsGateway: EventsGateway, // EventsGateway ni inject qilish
  ) {}

  async create(createStockDto: CreateStockDto, createdById: string): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findOne({ where: { productName: createStockDto.productName } });
    if (existingStock) {
      throw new BadRequestException('Ushbu nomdagi mahsulot allaqachon mavjud.');
    }

    const newStock = this.stockRepository.create({ ...createStockDto, createdById });
    const savedStock = await this.stockRepository.save(newStock);

    await this.activityLogService.create({
      action: 'CREATE_STOCK',
      entityType: 'Stock',
      entityId: savedStock.id,
      details: { productName: savedStock.productName, quantity: savedStock.quantity, price: savedStock.price },
      createdById: createdById,
    });

    this.eventsGateway.emitToAll('stockUpdate', savedStock); // WebSocket orqali yangilanish yuborish
    return savedStock;
  }

  async findAll(filterDto: FilterStockDto): Promise<StockResponseDto[]> {
    const query = this.stockRepository.createQueryBuilder('stock');

    if (filterDto.productName) {
      query.andWhere('stock.productName ILIKE :productName', { productName: `%${filterDto.productName}%` });
    }
    if (filterDto.unit) {
      query.andWhere('stock.unit = :unit', { unit: filterDto.unit });
    }
    if (filterDto.minQuantity) {
      query.andWhere('stock.quantity >= :minQuantity', { minQuantity: filterDto.minQuantity });
    }
    if (filterDto.maxQuantity) {
      query.andWhere('stock.quantity <= :maxQuantity', { maxQuantity: filterDto.maxQuantity });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<StockResponseDto> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto, updatedById: string): Promise<StockResponseDto> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }

    const oldStock = { ...stock };

    Object.assign(stock, updateStockDto);
    stock.updatedById = updatedById;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'UPDATE_STOCK',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: {
        oldQuantity: oldStock.quantity,
        newQuantity: updatedStock.quantity,
        oldPrice: oldStock.price,
        newPrice: updatedStock.price,
      },
      createdById: updatedById,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock); // WebSocket orqali yangilanish yuborish
    return updatedStock;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }
    await this.stockRepository.remove(stock);

    await this.activityLogService.create({
      action: 'DELETE_STOCK',
      entityType: 'Stock',
      entityId: id,
      details: { productName: stock.productName, quantity: stock.quantity },
      createdById: removedById,
    });

    this.eventsGateway.emitToAll('stockUpdate', { id, deleted: true }); // WebSocket orqali o'chirilganini bildirish
  }

  // Mahsulot miqdorini kamaytirish (sotuv uchun)
  async decreaseStockQuantity(productId: string, quantity: number, userId: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id: productId } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${productId} bo'lgan mahsulot topilmadi.`);
    }
    if (stock.quantity < quantity) {
      throw new BadRequestException(`${stock.productName} mahsuloti uchun yetarli miqdor yo'q. Mavjud: ${stock.quantity}`);
    }

    const oldQuantity = stock.quantity;
    stock.quantity -= quantity;
    stock.updatedById = userId;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'DECREASE_STOCK_QUANTITY',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: { productName: updatedStock.productName, oldQuantity, newQuantity: updatedStock.quantity, decreasedBy: quantity },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock);
    return updatedStock;
  }

  // Mahsulot miqdorini oshirish (qaytarganda yoki kirimda)
  async increaseStockQuantity(productId: string, quantity: number, userId: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id: productId } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${productId} bo'lgan mahsulot topilmadi.`);
    }

    const oldQuantity = stock.quantity;
    stock.quantity += quantity;
    stock.updatedById = userId;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'INCREASE_STOCK_QUANTITY',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: { productName: updatedStock.productName, oldQuantity, newQuantity: updatedStock.quantity, increasedBy: quantity },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock);
    return updatedStock;
  }
}
