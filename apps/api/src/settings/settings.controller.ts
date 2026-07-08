import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(user.id);
  }

  @Put('resume')
  updateResume(
    @CurrentUser() user: User,
    @Body() body: { resumeText: string },
  ) {
    return this.settingsService.updateResume(user.id, body.resumeText);
  }

  @Put('preferences')
  updatePreferences(
    @CurrentUser() user: User,
    @Body() body: { theme?: string; preferences?: string },
  ) {
    return this.settingsService.updatePreferences(user.id, body);
  }
}
