import { Controller, Get, Req, Res } from '@nestjs/common';
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
}
