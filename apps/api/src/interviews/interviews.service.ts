import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { InterviewQuestion } from './entities/interview-question.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { CompleteInterviewDto } from './dto/complete-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
  ) {}

  async findAll(
    userId: string,
    filters: { upcoming?: string; applicationId?: string },
  ) {
    const where: any = { userId };

    if (filters.applicationId) {
      where.applicationId = filters.applicationId;
    }

    const order: any = { dateTime: 'ASC' };
    let interviews = await this.interviewRepository.find({
      where,
      order,
      relations: { company: true, application: true },
    });

    if (filters.upcoming === 'true') {
      interviews = interviews.filter((i) => !i.completed);
    }

    return interviews;
  }

  async findOne(id: string, userId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id, userId },
      relations: { questions: true, application: true, company: true },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  async create(userId: string, dto: CreateInterviewDto) {
    const interview = this.interviewRepository.create({
      ...dto,
      userId,
      dateTime: new Date(dto.dateTime),
    });
    return this.interviewRepository.save(interview);
  }

  async update(id: string, userId: string, dto: UpdateInterviewDto) {
    const interview = await this.findOne(id, userId);
    if (dto.dateTime) {
      (dto as any).dateTime = new Date(dto.dateTime);
    }
    Object.assign(interview, dto);
    return this.interviewRepository.save(interview);
  }

  async complete(id: string, userId: string, dto: CompleteInterviewDto) {
    const interview = await this.findOne(id, userId);
    interview.completed = true;
    if (dto.feedback) {
      interview.feedback = dto.feedback;
    }
    return this.interviewRepository.save(interview);
  }

  async remove(id: string, userId: string) {
    const interview = await this.findOne(id, userId);
    await this.interviewRepository.remove(interview);
    return { deleted: true };
  }
}
