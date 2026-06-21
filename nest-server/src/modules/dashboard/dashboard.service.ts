import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportData, ReportDataDocument } from './schemas/report-data.schema';
import { LineData, LineDataDocument } from './schemas/line-data.schema';
import { PieCityData, PieCityDataDocument } from './schemas/pie-city-data.schema';
import { PieAgeData, PieAgeDataDocument } from './schemas/pie-age-data.schema';
import { RadarData, RadarDataDocument } from './schemas/radar-data.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(ReportData.name) private reportDataModel: Model<ReportDataDocument>,
    @InjectModel(LineData.name) private lineDataModel: Model<LineDataDocument>,
    @InjectModel(PieCityData.name) private pieCityDataModel: Model<PieCityDataDocument>,
    @InjectModel(PieAgeData.name) private pieAgeDataModel: Model<PieAgeDataDocument>,
    @InjectModel(RadarData.name) private radarDataModel: Model<RadarDataDocument>,
  ) {}

  async getReportData() {
    return this.reportDataModel.findOne({ _id: '68a547d25413ed173c14a276' }).lean().exec();
  }

  async getLineData() {
    return this.lineDataModel.findOne({ _id: '68a548cc5413ed173c14a281' }).lean().exec();
  }

  async getPieCityData() {
    return this.pieCityDataModel.find({}).lean().exec();
  }

  async getPieAgeData() {
    return this.pieAgeDataModel.find({}).lean().exec();
  }

  async getRadarData() {
    return this.radarDataModel.findOne({ _id: '68a549515413ed173c14a283' }).lean().exec();
  }
}
