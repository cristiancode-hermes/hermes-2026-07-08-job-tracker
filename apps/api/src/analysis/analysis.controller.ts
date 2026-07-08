import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Analysis')
@Controller('api/analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post('match')
  analyzeMatch(
    @CurrentUser() user: User,
    @Body() body: { applicationId: string; resumeText: string },
  ) {
    return this.analysisService.analyzeMatch(
      body.applicationId,
      user.id,
      body.resumeText,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.analysisService.findOne(id, user.id);
  }

  @Get('applications/:applicationId')
  findByApplication(
    @CurrentUser() user: User,
    @Param('applicationId') applicationId: string,
  ) {
    return this.analysisService.findByApplication(applicationId, user.id);
  }
}
