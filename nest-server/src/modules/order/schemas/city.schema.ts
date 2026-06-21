import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDocument = City & Document;

@Schema({ collection: 'citylists', strict: false })
export class City {
  @Prop()
  _id: string;
}

export const CitySchema = SchemaFactory.createForClass(City);
