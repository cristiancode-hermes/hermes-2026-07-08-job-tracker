import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('kpis')
  getKPIs(@CurrentUser() user: User) {
    return this.dashboardService.getKPIs(user.id);
  }

  @Get('status-distribution')
  getStatusDistribution(@CurrentUser() user: User) {
    return this.dashboardService.getStatusDistribution(user.id);
  }

  @Get('upcoming-interviews')
  getUpcomingInterviews(@CurrentUser() user: User) {
    return this.dashboardService.getUpcomingInterviews(user.id);
  }

  @Get('recent-activity')
  getRecentActivity(@CurrentUser() user: User) {
    return this.dashboardService.getRecentActivity(user.id);
  }
}
