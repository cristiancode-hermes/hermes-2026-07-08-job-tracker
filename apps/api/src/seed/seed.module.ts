import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { Interview } from '../interviews/entities/interview.entity';
import { InterviewQuestion } from '../interviews/entities/interview-question.entity';
import { CoverLetter } from '../cover-letters/entities/cover-letter.entity';
import { AIAnalysis } from '../analysis/entities/ai-analysis.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Company,
      JobApplication,
      Interview,
      InterviewQuestion,
      CoverLetter,
      AIAnalysis,
      UserSettings,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
