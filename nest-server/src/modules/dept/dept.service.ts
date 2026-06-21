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

  async create(body: { deptName: string; userName: string; parentId?: string }) {
    const { deptName, userName, parentId } = body;
    const newDept = {
      _id: new Date().toString(),
      deptName,
      userName,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      children: [],
    };

    if (parentId) {
      const result = await this.deptModel.findOneAndUpdate(
        { 'children._id': parentId },
        { $push: { 'children.$.children': newDept } },
        { new: true },
      );

      if (!result) {
        const topParent = await this.deptModel.findOneAndUpdate(
          { _id: parentId } as any,
          { $push: { children: newDept } },
          { new: true },
        );
        if (!topParent) return { code: 1, msg: '父部门不存在' };
      }
    } else {
      await this.deptModel.create(newDept as any);
    }

    return { code: 0, msg: '创建成功', data: {} };
  }

  async edit(body: { _id: string; deptName: string; userName: string }) {
    const { _id, deptName, userName } = body;
    const dept = await this.deptModel.findOne({ _id } as any);
    if (!dept) return { code: 1, msg: '部门不存在' };

    dept.deptName = deptName;
    dept.userName = userName;
    dept.updateTime = new Date().toLocaleString();
    await dept.save();

    return { code: 0, msg: '编辑成功', data: dept };
  }

  async delete(_id: string) {
    const list: any[] = await this.deptModel.find({}).lean().exec();
    const deleted = this.deleteDeptRecursively(list, _id);
    if (!deleted) return { code: 1, msg: '部门不存在' };

    await this.deptModel.deleteMany({});
    if (list.length > 0) {
      await this.deptModel.insertMany(list);
    }

    return { code: 0, msg: '删除成功', data: null };
  }

  private deleteDeptRecursively(list: any[], id: string): boolean {
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      if (item._id.toString() === id) {
        list.splice(i, 1);
        return true;
      }
      if (item.children && item.children.length > 0) {
        const deleted = this.deleteDeptRecursively(item.children, id);
        if (deleted) return true;
      }
    }
    return false;
  }
}
