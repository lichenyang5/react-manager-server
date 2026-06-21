import { Controller, Get, Req, Res } from '@nestjs/common';
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
}
