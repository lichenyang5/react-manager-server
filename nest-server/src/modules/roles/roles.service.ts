import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findList(roleName?: string) {
    const query: Record<string, any> = {};
    if (roleName) query.roleName = roleName;
    return this.roleModel.find(query).lean().exec();
  }

  async findAll() {
    return this.roleModel.find({}).lean().exec();
  }

  async create(body: any) {
    const newRole = {
      _id: new Date().toISOString(),
      permissionList: {
        checkedKeys: [],
        halfCheckedKeys: [],
      },
      updateTime: new Date().toLocaleString(),
      createTime: new Date().toLocaleString(),
      remark: '',
      ...body,
    };
    const resData = await this.roleModel.create(newRole as any);
    return { code: 0, msg: '', data: resData };
  }

  async edit(body: any) {
    const { _id, ...item } = body;
    const data = await this.roleModel.findOneAndUpdate(
      { _id } as any,
      { $set: { ...item } },
      { new: true },
    );
    return { code: 0, msg: '编辑成功', data };
  }

  async delete(_id: string) {
    await this.roleModel.deleteOne({ _id } as any);
    return { code: 0, msg: '删除成功', data: {} };
  }

  async updataPermission(_id: string, permissionList: any) {
    await this.roleModel.findOneAndUpdate(
      { _id } as any,
      { $set: { permissionList } },
    );
    return { code: 0, msg: '成功', data: {} };
  }
}
