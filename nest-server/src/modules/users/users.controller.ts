import { Controller, Get, Post, Req, Res } from '@nestjs/common';
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

  @Get('list')
  async list(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const { state, userId, userName } = req.query as Record<string, string>;
    const data = await this.usersService.findUserList({ state, userId, userName });
    return res.send({ code: 0, data, msg: 'success' });
  }

  @Get('all/list')
  async allList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.usersService.findAllUsers();
    return res.send({ code: 0, msg: 'success', data });
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

  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.usersService.createUser(req.body);
    return res.send(result);
  }

  @Post('edit')
  async edit(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.usersService.editUser(req.body);
    return res.send(result);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.usersService.deleteUser(req.body.userId);
    return res.send(result);
  }
}
