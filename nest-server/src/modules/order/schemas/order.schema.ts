import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orderlists', strict: false })
export class Order {
  @Prop()
  _id: string;

  @Prop()
  orderId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
