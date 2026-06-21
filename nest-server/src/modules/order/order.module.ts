import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { City, CitySchema } from './schemas/city.schema';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Driver, DriverSchema } from './schemas/driver.schema';
import { CityData, CityDataSchema } from './schemas/city-data.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: City.name, schema: CitySchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: CityData.name, schema: CityDataSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
