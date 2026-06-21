import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserPermissionDocument = UserPermission & Document;

@Schema({ collection: 'userpermissionlists', strict: false })
export class UserPermission {
  @Prop()
  buttonList: string[];

  @Prop()
  menuList: any[];
}

export const UserPermissionSchema =
  SchemaFactory.createForClass(UserPermission);
