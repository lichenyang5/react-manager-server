import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { City, CityDocument } from './schemas/city.schema';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { CityData, CityDataDocument } from './schemas/city-data.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(CityData.name) private cityDataModel: Model<CityDataDocument>,
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

  async findOrderDetail(orderId: string) {
    const order = await this.orderModel.findOne({ orderId }).lean().exec();
    if (order) {
      return { code: 0, msg: '', data: order };
    }
    return { code: 1, msg: '订单不存在', data: {} };
  }

  async findCityData(cityId: string) {
    const city = await this.cityDataModel.findOne({ cityId }).lean().exec();
    return { code: 0, data: (city as any)?.points ?? null };
  }

  async createOrder(body: any) {
    const newOrder = {
      _id: Date.now().toString(),
      orderId: `T${Date.now().toString()}`,
      ...body,
      createTime: new Date().toISOString(),
    };
    await this.orderModel.create(newOrder as any);
    return { code: 0, msg: '创建订单成功', data: newOrder };
  }

  async editOrder(body: any) {
    const { orderId, route: newRouter } = body;
    if (!orderId || !Array.isArray(newRouter)) {
      return { msg: '参数不合法' };
    }
    const list = await this.orderModel.findOneAndUpdate(
      { orderId },
      { $set: { route: newRouter } },
    );
    return { code: 0, msg: '更新成功', data: list };
  }

  async deleteOrder(id: string) {
    await this.orderModel.deleteOne({ orderId: id });
    return { msg: '删除成功', code: 0, data: {} };
  }

  async exportOrders() {
    return this.orderModel.find({}).lean().exec();
  }
}
