import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
 