import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1/MyManager';

@Module({
  imports: [MongooseModule.forRoot(MONGODB_URI)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
