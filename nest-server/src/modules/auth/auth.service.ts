import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../common/constants/jwt.constant';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(userName: string, userPwd: string) {
    const user = await this.userModel.findOne({ userName });
    if (user && userPwd === '111111') {
      const token = jwt.sign(
        {
          id: user._id,
          userName: user.userName,
          roleList: user.roleList,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );
      return { code: 0, data: { token }, msg: '登录成功' };
    }
    return { code: 1, data: {}, msg: '账号密码错误' };
  }
}
