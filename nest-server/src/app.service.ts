import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getDbHealth(): { code: number; msg: string; data: { mongo: string } } {
    if (this.connection.readyState === 1) {
      return { code: 0, msg: 'ok', data: { mongo: 'connected' } };
    }
    return { code: 1, msg: 'mongo disconnected', data: { mongo: 'disconnected' } };
  }
}
