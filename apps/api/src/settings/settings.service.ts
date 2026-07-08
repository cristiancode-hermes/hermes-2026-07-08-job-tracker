import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
  ) {}

  async getSettings(userId: string) {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });
    if (!settings) {
      settings = this.settingsRepository.create({ userId });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateResume(userId: string, resumeText: string) {
    const settings = await this.getSettings(userId);
    settings.resumeText = resumeText;
    await this.settingsRepository.save(settings);
    return { resumeText: settings.resumeText };
  }

  async updatePreferences(
    userId: string,
    data: { theme?: string; preferences?: string },
  ) {
    const settings = await this.getSettings(userId);
    if (data.theme) {
      settings.theme = data.theme;
    }
    if (data.preferences) {
      settings.preferences = data.preferences;
    }
    return this.settingsRepository.save(settings);
  }
}
