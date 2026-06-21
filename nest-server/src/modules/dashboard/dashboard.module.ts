import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportData, ReportDataSchema } from './schemas/report-data.schema';
import { LineData, LineDataSchema } from './schemas/line-data.schema';
import { PieCityData, PieCityDataSchema } from './schemas/pie-city-data.schema';
import { PieAgeData, PieAgeDataSchema } from './schemas/pie-age-data.schema';
import { RadarData, RadarDataSchema } from './schemas/radar-data.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportData.name, schema: ReportDataSchema },
      { name: LineData.name, schema: LineDataSchema },
      { name: PieCityData.name, schema: PieCityDataSchema },
      { name: PieAgeData.name, schema: PieAgeDataSchema },
      { name: RadarData.name, schema: RadarDataSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
