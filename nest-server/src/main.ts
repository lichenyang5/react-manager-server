import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public', 'images'), {
    prefix: '/images/',
  });
  await app.listen(3001);
  console.log('NestJS 服务已启动: http://localhost:3001');
}
bootstrap();
