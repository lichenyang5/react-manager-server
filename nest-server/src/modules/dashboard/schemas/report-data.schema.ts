import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDataDocument = ReportData & Document;

@Schema({ collection: 'reportdatas', strict: false })
export class ReportData {}

export const ReportDataSchema = SchemaFactory.createForClass(ReportData);
