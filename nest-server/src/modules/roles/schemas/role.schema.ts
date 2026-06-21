import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ collection: 'rolelists', strict: false })
export class Role {
  @Prop()
  _id: string;

  @Prop()
  roleName: string;

  @Prop()
  remark: string;

  @Prop({ type: Object })
  permissionList: Record<string, any>;

  @Prop()
  updateTime: string;

  @Prop()
  createTime: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
