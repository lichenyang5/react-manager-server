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

  async create(body: any) {
    const newMenu = {
      ...body,
      _id: Date.now().toString(),
      createTime: new Date().toISOString(),
      children: [],
      button: [],
    };

    if (body.parentId) {
      const result = await this.menuModel.findOneAndUpdate(
        { _id: body.parentId },
        { $push: { children: newMenu } },
        { new: true },
      );
      if (!result) {
        return { code: 1, msg: '父级菜单不存在' };
      }
    } else {
      await this.menuModel.create(newMenu);
    }

    return { code: 0, msg: '创建成功' };
  }

  async edit(body: any) {
    const updates = { ...body };
    if (updates.parentId) delete updates.parentId;

    const menu = await this.menuModel.findOne({ _id: body._id });
    if (!menu) return { code: 1, msg: '菜单不存在' };

    Object.assign(menu, updates);
    await menu.save();

    return { code: 0, msg: '编辑成功' };
  }

  async delete(_id: string) {
    let menus = await this.menuModel.find({});
    const list = menus.map((m) => m.toObject());

    const deleted = this.deleteMenuRecursively(list, _id);
    if (!deleted) return { code: 1, msg: '菜单不存在' };

    await this.menuModel.deleteMany({});
    if (list.length > 0) {
      await this.menuModel.insertMany(list);
    }

    return { code: 0, msg: '删除成功' };
  }

  private deleteMenuRecursively(list: any[], id: string): boolean {
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      if (item._id === id) {
        list.splice(i, 1);
        return true;
      }
      if (item.children && item.children.length > 0) {
        const deleted = this.deleteMenuRecursively(item.children, id);
        if (deleted) return true;
      }
    }
    return false;
  }
}
