import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIAnalysis } from './entities/ai-analysis.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { AIStrategy } from './strategies/ai-strategy.interface';
import { OpenAIStrategy } from './strategies/openai.strategy';
import { LocalFallbackStrategy } from './strategies/local-fallback.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalysisService {
  private strategy: AIStrategy;

  constructor(
    @InjectRepository(AIAnalysis)
    private analysisRepository: Repository<AIAnalysis>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    private openAIStrategy: OpenAIStrategy,
    private localFallbackStrategy: LocalFallbackStrategy,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.strategy = apiKey ? this.openAIStrategy : this.localFallbackStrategy;
  }

  async analyzeMatch(applicationId: string, userId: string, resumeText: string) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, userId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const jobDescription = [
      application.title,
      application.description,
      application.salary,
      application.location,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await this.strategy.analyze(
      applicationId,
      resumeText,
      jobDescription,
    );

    const analysis = this.analysisRepository.create({
      userId,
      applicationId,
      resumeText,
      matchScore: result.matchScore,
      strengths: JSON.stringify(result.strengths),
      gaps: JSON.stringify(result.gaps),
      suggestions: JSON.stringify(result.suggestions),
      modelUsed: this.configService.get<string>('OPENAI_API_KEY')
        ? 'openai-gpt-4o-mini'
        : 'local-fallback',
    });

    return this.analysisRepository.save(analysis);
  }

  async findOne(id: string, userId: string) {
    const analysis = await this.analysisRepository.findOne({
      where: { id, userId },
      relations: {},
    });
    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }
    return analysis;
  }

  async findByApplication(applicationId: string, userId: string) {
    return this.analysisRepository.find({
      where: { applicationId, userId },
      order: { createdAt: 'DESC' },
      relations: {},
    });
  }
}
