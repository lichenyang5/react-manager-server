import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dept, DeptDocument } from './schemas/dept.schema';

@Injectable()
export class DeptService {
  constructor(@InjectModel(Dept.name) private deptModel: Model<DeptDocument>) {}

  async findList(deptName?: string) {
    let list = await this.deptModel.find({}).lean().exec();
    if (deptName) {
      list = list.filter(
        (item: any) => item.deptName && item.deptName.includes(deptName),
      );
    }
    return list;
  }
}
