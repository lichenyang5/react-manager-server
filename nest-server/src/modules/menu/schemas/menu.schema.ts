import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ collection: 'menulists', strict: false })
export class Menu {
  @Prop()
  _id: string;

  @Prop()
  menuType: number;

  @Prop()
  menuName: string;

  @Prop()
  path: string;

  @Prop()
  component: string;

  @Prop()
  orderBy: number;

  @Prop()
  menuState: number;

  @Prop()
  icon: string;

  @Prop()
  children: any[];

  @Prop()
  button: any[];

  @Prop()
  createTime: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
