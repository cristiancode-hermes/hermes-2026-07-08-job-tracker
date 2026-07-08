import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { CompleteInterviewDto } from './dto/complete-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Interviews')
@Controller('api/interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('upcoming') upcoming?: string,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.interviewsService.findAll(user.id, { upcoming, applicationId });
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.interviewsService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(id, user.id, dto);
  }

  @Patch(':id/complete')
  complete(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CompleteInterviewDto,
  ) {
    return this.interviewsService.complete(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.interviewsService.remove(id, user.id);
  }
}
