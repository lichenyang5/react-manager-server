import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RolesService } from './roles.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

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

    const { roleName } = req.query as Record<string, string>;
    const data = await this.rolesService.findList(roleName);
    return res.send({ code: 0, msg: '', data: { list: data } });
  }

  @Get('alllist')
  async allList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.rolesService.findAll();
    return res.send({ code: 0, msg: '', data });
  }

  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.rolesService.create(req.body);
    return res.send(result);
  }

  @Post('edit')
  async edit(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.rolesService.edit(req.body);
    return res.send(result);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.rolesService.delete(req.body._id);
    return res.send(result);
  }

  @Post('updata/permission')
  async updataPermission(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const { _id, permissionList } = req.body;
    const result = await this.rolesService.updataPermission(_id, permissionList);
    return res.send(result);
  }
}
