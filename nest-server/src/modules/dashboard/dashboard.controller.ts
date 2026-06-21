import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { verifyTokenFromRequest } from '../../common/utils/token.util';

@Controller('order/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('getReportData')
  async getReportData(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const data = await this.dashboardService.getReportData();
    return res.send({ code: 0, msg: '', data });
  }

  @Get('getLineData')
  async getLineData(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const data = await this.dashboardService.getLineData();
    return res.send({ code: 0, msg: '', data });
  }

  @Get('getPieCityData')
  async getPieCityData(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const data = await this.dashboardService.getPieCityData();
    return res.send({ code: 0, msg: '', data });
  }

  @Get('getPieAgeData')
  async getPieAgeData(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const data = await this.dashboardService.getPieAgeData();
    return res.send({ code: 0, msg: '', data });
  }

  @Get('getRadarData')
  async getRadarData(@Req() req: Request, @Res() res: Response) {
    const user = verifyTokenFromRequest(req);
    if (!user) {
      return res.status(201).send({ code: 500001, data: {}, msg: 'token 失效或未登录' });
    }
    const data = await this.dashboardService.getRadarData();
    return res.send({ code: 0, msg: '', data });
  }
}
