import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PieCityDataDocument = PieCityData & Document;

@Schema({ collection: 'piecitydatas', strict: false })
export class PieCityData {}

export const PieCityDataSchema = SchemaFactory.createForClass(PieCityData);
