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
}
