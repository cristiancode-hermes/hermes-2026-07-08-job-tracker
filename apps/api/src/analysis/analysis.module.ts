import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AIAnalysis } from './entities/ai-analysis.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { OpenAIStrategy } from './strategies/openai.strategy';
import { LocalFallbackStrategy } from './strategies/local-fallback.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([AIAnalysis, JobApplication])],
  controllers: [AnalysisController],
  providers: [AnalysisService, OpenAIStrategy, LocalFallbackStrategy],
  exports: [AnalysisService],
})
export class AnalysisModule {}
