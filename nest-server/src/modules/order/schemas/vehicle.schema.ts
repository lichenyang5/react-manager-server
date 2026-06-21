import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ collection: 'vehiclelists', strict: false })
export class Vehicle {
  @Prop()
  _id: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
