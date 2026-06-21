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

  async findUserList(query: { state?: string; userId?: string; userName?: string }) {
    const all = await this.userModel.find({}, { userPwd: 0 }).lean().exec();
    let list = all as any[];

    if (query.state && query.state !== '0') {
      list = list.filter((item) => String(item.state) === String(query.state));
    }
    if (query.userId) {
      list = list.filter((item) =>
        String(item.userId).includes(String(query.userId)),
      );
    }
    if (query.userName) {
      list = list.filter(
        (item) => item.userName && item.userName.includes(query.userName),
      );
    }

    return {
      list,
      page: {
        pageSize: 1,
        pageNumber: 10,
        total: list.length,
      },
    };
  }

  async findAllUsers() {
    return this.userModel.find({}, { userPwd: 0 }).lean().exec();
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
