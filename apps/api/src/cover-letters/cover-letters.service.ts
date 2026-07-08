import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from './entities/cover-letter.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { CoverLetterStrategy } from './strategies/cover-letter-strategy.interface';
import { OpenAICoverLetterStrategy } from './strategies/openai-cover-letter.strategy';
import { TemplateStrategy } from './strategies/template.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoverLettersService {
  private strategy: CoverLetterStrategy;

  constructor(
    @InjectRepository(CoverLetter)
    private coverLetterRepository: Repository<CoverLetter>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    private openAIStrategy: OpenAICoverLetterStrategy,
    private templateStrategy: TemplateStrategy,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.strategy = apiKey ? this.openAIStrategy : this.templateStrategy;
  }

  async generate(
    userId: string,
    applicationId: string,
    tone: string = 'professional',
    customLength: string = 'medium',
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, userId },
      relations: { company: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const resumeText = application.resumeText || '';
    const jobDescription = [
      application.title,
      application.description,
    ]
      .filter(Boolean)
      .join('\n');
    const companyName = application.company?.name || 'the Company';

    const result = await this.strategy.generate(
      applicationId,
      tone,
      customLength,
      resumeText,
      jobDescription,
      companyName,
    );

    const coverLetter = this.coverLetterRepository.create({
      userId,
      applicationId,
      content: result.content,
      tone,
      length: customLength,
    });

    const saved = await this.coverLetterRepository.save(coverLetter);

    return {
      id: saved.id,
      content: saved.content,
      preview: result.preview,
      tone: saved.tone,
      length: saved.length,
      version: saved.version,
      createdAt: saved.createdAt,
    };
  }

  async create(
    userId: string,
    dto: { applicationId: string; content: string; tone: string; length: string },
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId, userId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const letter = this.coverLetterRepository.create({
      ...dto,
      userId,
    });
    return this.coverLetterRepository.save(letter);
  }

  async findByApplication(applicationId: string, userId: string) {
    return this.coverLetterRepository.find({
      where: { applicationId, userId },
      order: { createdAt: 'DESC' },
      relations: {},
    });
  }

  async findOne(id: string, userId: string) {
    const letter = await this.coverLetterRepository.findOne({
      where: { id, userId },
      relations: {},
    });
    if (!letter) {
      throw new NotFoundException('Cover letter not found');
    }
    return letter;
  }

  async remove(id: string, userId: string) {
    const letter = await this.findOne(id, userId);
    await this.coverLetterRepository.remove(letter);
    return { deleted: true };
  }
}
