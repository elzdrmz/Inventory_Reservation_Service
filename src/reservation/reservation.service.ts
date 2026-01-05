import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { KafkaService } from '../services/kafka.service';
import { RedisService } from '../services/redis.service';
import { findExpiring } from '../utils/algorithm';

@Injectable()
export class ReservationService { 
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private kafkaService: KafkaService,
    private redisService: RedisService,
  ) {}

  async createReservation(createReservationDto: CreateReservationDto) {
    const { productId, quantity } = createReservationDto;

    // Try to get product from cache first
    const cacheKey = `product:${productId}`;
    const cachedProduct = await this.redisService.get(cacheKey);

    let product: ProductDocument;

    if (cachedProduct) {
      product = JSON.parse(cachedProduct);
      // Verify with database for stock accuracy (cache might be stale for stock)
      const dbProduct = await this.productModel.findById(productId);
      if (!dbProduct) {
        await this.redisService.del(cacheKey);
        throw new NotFoundException('Product not found');
      }
      product = dbProduct;
    } else {
      product = await this.productModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      // Cache the product for 5 minutes
      await this.redisService.set(cacheKey, JSON.stringify(product), 300);
    }

    // Check if enough stock is available
    if (product.stock < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Create reservation
    const reservationId = uuidv4();
    const reservation = new this.reservationModel({
      _id: reservationId,
      productId,
      quantity,
      createdAt: new Date(),
    });

    // Update product stock
    product.stock -= quantity;
    await product.save();

    // Invalidate cache after stock update
    await this.redisService.del(cacheKey);

    // Save reservation
    await reservation.save();

    // Publish event to Kafka
    await this.kafkaService.publishReservationEvent({
      reservationId,
      productId,
      quantity,
      timestamp: reservation.createdAt.toISOString(),
    });

    return {
      reservationId: reservation._id,
      productId: reservation.productId,
      quantity: reservation.quantity,
      createdAt: reservation.createdAt,
    };
  }

  async getReservation(id: string) {
    const reservation = await this.reservationModel.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return {
      reservationId: reservation._id,
      productId: reservation.productId,
      quantity: reservation.quantity,
      createdAt: reservation.createdAt,
    };
  }

  async getExpiringProducts(days: number): Promise<string[]> {
    const products = await this.productModel.find({}).lean();

    const productsForAlgorithm = products.map((p) => ({
      id: p._id,
      expiry: p.expiryDate.toISOString(),
      stock: p.stock,
    }));

    return findExpiring(productsForAlgorithm, days);
  }
}
