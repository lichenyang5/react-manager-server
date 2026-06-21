import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeptDocument = Dept & Document;

@Schema({ collection: 'deptlists', strict: false })
export class Dept {
  @Prop()
  _id: string;

  @Prop()
  deptName: string;

  @Prop()
  parentId: string;

  @Prop()
  userName: string;

  @Prop()
  createTime: string;

  @Prop()
  updateTime: string;

  @Prop()
  children: any[];
}

export const DeptSchema = SchemaFactory.createForClass(Dept);
