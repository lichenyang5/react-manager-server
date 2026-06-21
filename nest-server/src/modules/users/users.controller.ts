import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('getUserInfo')
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.usersService.findByRoleList(user.roleList);
    if (!data) {
      return res.send({ code: 1, msg: '未找到该用户', data: {} });
    }
    return res.send({ code: 0, msg: '', data });
  }

  @Get('getPermissionList')
  async getPermissionList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.usersService.getPermissionList();
    return res.send({ meg: '', code: 0, data });
  }
}
