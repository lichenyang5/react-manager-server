import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'userslists', strict: false })
export class User {
  @Prop()
  userId: number;

  @Prop()
  userName: string;

  @Prop()
  userPwd: string;

  @Prop()
  userEmail: string;

  @Prop()
  mobile: string;

  @Prop()
  job: string;

  @Prop()
  deptId: string;

  @Prop()
  deptName: string;

  @Prop()
  role: number;

  @Prop()
  roleList: string;

  @Prop()
  state: number;

  @Prop()
  userImg: string;

  @Prop()
  create: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
