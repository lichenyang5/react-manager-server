import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PieAgeDataDocument = PieAgeData & Document;

@Schema({ collection: 'pieagedatas', strict: false })
export class PieAgeData {}

export const PieAgeDataSchema = SchemaFactory.createForClass(PieAgeData);
