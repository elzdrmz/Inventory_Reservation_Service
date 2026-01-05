import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product { 
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  stock: number;
 
  @Prop({ required: true })
  expiryDate: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
