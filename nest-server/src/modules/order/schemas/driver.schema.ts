import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ collection: 'driverlists', strict: false })
export class Driver {
  @Prop()
  _id: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
