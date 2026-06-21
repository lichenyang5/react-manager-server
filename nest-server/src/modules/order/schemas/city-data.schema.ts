import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDataDocument = CityData & Document;

@Schema({ collection: 'citydatas', strict: false })
export class CityData {
  @Prop()
  _id: string;
}

export const CityDataSchema = SchemaFactory.createForClass(CityData);
