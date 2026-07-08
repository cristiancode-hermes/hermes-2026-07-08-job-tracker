import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobApplication } from './entities/job-application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { EventsService } from '../events/events.service';

// Status transition map: current -> allowed next
const STATUS_TRANSITIONS: Record<string, string[]> = {
  saved: ['applied', 'rejected', 'withdrawn'],
  applied: ['screening', 'rejected', 'withdrawn'],
  screening: ['interview', 'rejected', 'withdrawn'],
  interview: ['offer', 'rejected', 'withdrawn'],
  offer: ['accepted', 'rejected', 'withdrawn'],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    private eventsService: EventsService,
  ) {}

  async findAll(
    userId: string,
    filters: {
      status?: string;
      search?: string;
      companyId?: string;
      sort?: string;
    },
  ) {
    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.title = Like(`%${filters.search}%`);
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    const order: any = {};
    if (filters.sort === 'newest') {
      order.createdAt = 'DESC';
    } else if (filters.sort === 'oldest') {
      order.createdAt = 'ASC';
    } else if (filters.sort === 'title') {
      order.title = 'ASC';
    } else if (filters.sort === 'status') {
      order.status = 'ASC';
    } else if (filters.sort === 'updated') {
      order.updatedAt = 'DESC';
    } else {
      order.createdAt = 'DESC';
    }

    return this.applicationRepository.find({
      where,
      order,
      relations: {},
    });
  }

  async findOne(id: string, userId: string) {
    const application = await this.applicationRepository.findOne({
      where: { id, userId },
      relations: { company: true, interviews: true, coverLetters: true, analyses: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async create(userId: string, dto: CreateApplicationDto) {
    const application = this.applicationRepository.create({
      ...dto,
      userId,
      company: { id: dto.companyId },
    });
    return this.applicationRepository.save(application);
  }

  async update(id: string, userId: string, dto: UpdateApplicationDto) {
    const application = await this.findOne(id, userId);
    
    if (dto.companyId) {
      (application as any).company = { id: dto.companyId };
      delete dto.companyId;
    }
    
    Object.assign(application, dto);
    return this.applicationRepository.save(application);
  }

  async updateStatus(id: string, userId: string, dto: UpdateStatusDto) {
    const application = await this.findOne(id, userId);
    const currentStatus = application.status;
    const newStatus = dto.status;

    // Check if transition is allowed
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
      );
    }

    application.status = newStatus;
    
    // Set appliedAt when transitioning to applied
    if (newStatus === 'applied' && !application.appliedAt) {
      application.appliedAt = new Date();
    }

    const saved = await this.applicationRepository.save(application);

    // Emit status change event
    this.eventsService.emit('statusChange', {
      applicationId: id,
      previousStatus: currentStatus,
      newStatus,
      title: application.title,
      timestamp: new Date(),
    });

    return saved;
  }

  async remove(id: string, userId: string) {
    const application = await this.findOne(id, userId);
    await this.applicationRepository.remove(application);
    return { deleted: true };
  }
}
