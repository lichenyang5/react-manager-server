import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  UserPermission,
  UserPermissionDocument,
} from './schemas/user-permission.schema';

const PERMISSION_DOC_ID = '68a534ea5413ed173c14a251';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserPermission.name)
    private userPermissionModel: Model<UserPermissionDocument>,
  ) {}

  async findByRoleList(roleList: string) {
    return this.userModel.findOne({ roleList }).lean().exec();
  }

  async getPermissionList() {
    const data = await this.userPermissionModel
      .findOne({ _id: PERMISSION_DOC_ID })
      .lean()
      .exec();
    if (data && Array.isArray(data.menuList)) {
      this.cleanMenuButtons(data.menuList);
    }
    return data;
  }

  private cleanMenuButtons(menuList: any[]): void {
    if (!Array.isArray(menuList)) return;
    menuList.forEach((item) => {
      if (Array.isArray(item.children)) {
        if (item.children.length === 0) {
          delete item.children;
        } else {
          delete item.button;
          this.cleanMenuButtons(item.children);
        }
      }
    });
  }
}
