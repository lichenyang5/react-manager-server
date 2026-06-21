import { Controller, Get, Post, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as ExcelJS from 'exceljs';
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

  @Get('detail/:orderId')
  async detail(@Param('orderId') orderId: string, @Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.orderService.findOrderDetail(orderId);
    return res.send(result);
  }

  @Get('cityData/:cityId')
  async cityData(@Param('cityId') cityId: string, @Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.orderService.findCityData(cityId);
    return res.send(result);
  }

  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.orderService.createOrder(req.body);
    return res.send(result);
  }

  @Post('edit')
  async edit(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.orderService.editOrder(req.body);
    return res.send(result);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const result = await this.orderService.deleteOrder(req.body.id);
    return res.json(result);
  }

  @Post('export')
  async export(@Res() res: Response) {
    const stateMap = { 1: '进行中', 2: '完成', 3: '超时', 4: '取消' };
    const orders = await this.orderService.exportOrders();
    const newData = orders.map((item: any) => ({
      ...item,
      state: stateMap[item.state] || item.state,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('订单列表');
    worksheet.columns = [
      { header: '订单ID', key: 'orderId', width: 20 },
      { header: '城市', key: 'cityName', width: 15 },
      { header: '车型', key: 'vehicleName', width: 15 },
      { header: '下单时间', key: 'createTime', width: 20 },
      { header: '订单状态', key: 'state', width: 15 },
    ];
    worksheet.addRows(newData);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('file-name', encodeURIComponent('订单列表.xlsx'));
    await workbook.xlsx.write(res);
    res.end();
  }
}
