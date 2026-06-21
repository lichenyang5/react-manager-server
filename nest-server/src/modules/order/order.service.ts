import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { City, CityDocument } from './schemas/city.schema';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { Driver, DriverDocument } from './schemas/driver.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  ) {}

  async findOrderList(query: {
    orderId?: string;
    userName?: string;
    state?: string;
  }) {
    const filter: Record<string, any> = {};
    if (query.orderId) filter.orderId = query.orderId;
    if (query.userName) filter.userName = query.userName;
    if (query.state) filter.state = +query.state;

    const list = await this.orderModel.find(filter).lean().exec();
    return {
      list,
      page: {
        pageNum: 1,
        pageSize: 10,
        total: list.length,
      },
    };
  }

  async findCityList() {
    return this.cityModel.find({}).lean().exec();
  }

  async findVehicleList() {
    return this.vehicleModel.find({}).lean().exec();
  }

  async findDriverList(query: {
    driverName?: string;
    accountStatus?: string;
  }) {
    const filter: Record<string, any> = {};
    if (query.driverName) filter.driverName = query.driverName;
    if (query.accountStatus) filter.accountStatus = query.accountStatus;

    const list = await this.driverModel.find(filter).lean().exec();
    return { list };
  }
}
