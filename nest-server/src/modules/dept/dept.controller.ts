import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { DeptService } from './dept.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

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

    const { deptName } = req.query as Record<string, string>;
    const data = await this.deptService.findList(deptName);
    return res.send({ code: 0, data, msg: 'success' });
  }

  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.deptService.create(req.body);
    return res.send(result);
  }

  @Post('edit')
  async edit(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.deptService.edit(req.body);
    return res.send(result);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.deptService.delete(req.body._id);
    return res.send(result);
  }
}
