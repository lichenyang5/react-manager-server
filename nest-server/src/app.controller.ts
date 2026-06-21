import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { code: 0, msg: 'ok' };
  }

  @Get('health/db')
  healthDb() {
    return this.appService.getDbHealth();
  }
}
