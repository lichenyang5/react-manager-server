import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dept, DeptSchema } from './schemas/dept.schema';
import { DeptController } from './dept.controller';
import { DeptService } from './dept.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dept.name, schema: DeptSchema }])],
  controllers: [DeptController],
  providers: [DeptService],
})
export class DeptModule {}
