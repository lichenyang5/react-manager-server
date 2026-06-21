import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LineDataDocument = LineData & Document;

@Schema({ collection: 'linedatas', strict: false })
export class LineData {}

export const LineDataSchema = SchemaFactory.createForClass(LineData);
