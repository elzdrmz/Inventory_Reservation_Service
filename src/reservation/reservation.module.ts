import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { KafkaService } from '../services/kafka.service';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([ 
      { name: Product.name, schema: ProductSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, KafkaService, RedisService],
})
export class ReservationModule {}
