import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MenuService } from './menu.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

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

    const { menuName, menuState } = req.query as Record<string, string>;
    const data = await this.menuService.findList(menuName, menuState);
    return res.send({ code: 0, data, msg: '获取成功' });
  }

  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.menuService.create(req.body);
    return res.send(result);
  }

  @Post('edit')
  async edit(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.menuService.edit(req.body);
    return res.send(result);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.menuService.delete(req.body._id);
    return res.send(result);
  }
}
