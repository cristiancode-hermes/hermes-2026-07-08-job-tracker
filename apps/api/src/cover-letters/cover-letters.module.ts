import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLettersController } from './cover-letters.controller';
import { CoverLettersService } from './cover-letters.service';
import { CoverLetter } from './entities/cover-letter.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { OpenAICoverLetterStrategy } from './strategies/openai-cover-letter.strategy';
import { TemplateStrategy } from './strategies/template.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([CoverLetter, JobApplication])],
  controllers: [CoverLettersController],
  providers: [
    CoverLettersService,
    OpenAICoverLetterStrategy,
    TemplateStrategy,
  ],
  exports: [CoverLettersService],
})
export class CoverLettersModule {}
