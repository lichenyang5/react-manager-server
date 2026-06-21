import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RadarDataDocument = RadarData & Document;

@Schema({ collection: 'radardatas', strict: false })
export class RadarData {}

export const RadarDataSchema = SchemaFactory.createForClass(RadarData);
