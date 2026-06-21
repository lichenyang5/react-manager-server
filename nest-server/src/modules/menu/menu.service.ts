import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  async findList(menuName?: string, menuState?: string) {
    let list = await this.menuModel.find({}).lean().exec();

    if (menuName) {
      list = list.filter(
        (item: any) => item.menuName && item.menuName.includes(menuName),
      );
    }
    if (menuState) {
      list = list.filter(
        (item: any) => Number(item.menuState) === Number(menuState),
      );
    }

    this.cleanMenuButtons(list as any[]);
    return list;
  }

  private cleanMenuButtons(list: any[]): void {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (Array.isArray(item.children)) {
        if (item.children.length === 0) {
          delete item.button;
        } else {
          this.cleanMenuButtons(item.children);
        }
      }
    });
  }
}
