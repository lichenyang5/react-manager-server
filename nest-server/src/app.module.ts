import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DeptModule } from './modules/dept/dept.module';
import { MenuModule } from './modules/menu/menu.module';
import { RolesModule } from './modules/roles/roles.module';
import { OrderModule } from './modules/order/order.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1/MyManager';

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI),
    UsersModule,
    AuthModule,
    DeptModule,
    MenuModule,
    RolesModule,
    OrderModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
