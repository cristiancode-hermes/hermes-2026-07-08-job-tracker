import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CoverLettersService } from './cover-letters.service';
import { GenerateLetterDto } from './dto/generate-letter.dto';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cover Letters')
@Controller('api/cover-letters')
@UseGuards(JwtAuthGuard)
export class CoverLettersController {
  constructor(private coverLettersService: CoverLettersService) {}

  @Post('generate')
  generate(@CurrentUser() user: User, @Body() dto: GenerateLetterDto) {
    return this.coverLettersService.generate(
      user.id,
      dto.applicationId,
      dto.tone || 'professional',
      dto.length || 'medium',
    );
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCoverLetterDto) {
    return this.coverLettersService.create(user.id, dto);
  }

  @Get('applications/:applicationId')
  findByApplication(
    @CurrentUser() user: User,
    @Param('applicationId') applicationId: string,
  ) {
    return this.coverLettersService.findByApplication(applicationId, user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLettersService.findOne(id, user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLettersService.remove(id, user.id);
  }
}
