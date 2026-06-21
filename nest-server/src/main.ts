import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useStaticAssets(join(__dirname, '..', 'public', 'images'), {
    prefix: '/images/',
  });
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS 服务已启动: http://localhost:${port}`);
}
bootstrap();
