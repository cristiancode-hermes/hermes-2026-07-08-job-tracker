import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JobApplication } from '../applications/entities/job-application.entity';
import { Interview } from '../interviews/entities/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication, Interview])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
