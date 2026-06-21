import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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

    const { orderId, userName, state } = req.query as Record<string, string>;
    const data = await this.orderService.findOrderList({
      orderId,
      userName,
      state,
    });
    return res.send({ code: 0, data, msg: 'success' });
  }

  @Get('citylist')
  async cityList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.orderService.findCityList();
    return res.send({ code: 0, data, msg: '' });
  }

  @Get('vehiclelist')
  async vehicleList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const data = await this.orderService.findVehicleList();
    return res.send({ code: 0, data });
  }

  @Get('driver/list')
  async driverList(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录',
      });
    }

    const { driverName, accountStatus } = req.query as Record<string, string>;
    const data = await this.orderService.findDriverList({
      driverName,
      accountStatus,
    });
    return res.send({ code: 0, data, msg: '' });
  }
}
