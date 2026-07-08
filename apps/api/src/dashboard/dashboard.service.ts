import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from '../applications/entities/job-application.entity';
import { Interview } from '../interviews/entities/interview.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  async getKPIs(userId: string) {
    const allApps = await this.applicationRepository.find({
      where: { userId },
    });

    const totalApps = allApps.length;
    const inProgress = allApps.filter(
      (a) =>
        a.status === 'applied' ||
        a.status === 'screening' ||
        a.status === 'interview',
    ).length;
    const interviews = allApps.filter((a) => a.status === 'interview').length;
    const responded = allApps.filter(
      (a) =>
        a.status === 'interview' ||
        a.status === 'offer' ||
        a.status === 'accepted' ||
        a.status === 'rejected',
    ).length;
    const responseRate = totalApps > 0 ? Math.round((responded / totalApps) * 100) : 0;

    return { totalApps, inProgress, interviews, responseRate };
  }

  async getStatusDistribution(userId: string) {
    const allApps = await this.applicationRepository.find({
      where: { userId },
    });

    const distribution: Record<string, number> = {};
    for (const app of allApps) {
      distribution[app.status] = (distribution[app.status] || 0) + 1;
    }

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
    }));
  }

  async getUpcomingInterviews(userId: string) {
    const interviews = await this.interviewRepository.find({
      where: { userId, completed: false },
      relations: { company: true, application: true },
      order: { dateTime: 'ASC' },
    });

    return interviews.slice(0, 5).map((i) => ({
      id: i.id,
      type: i.type,
      dateTime: i.dateTime,
      companyName: i.company?.name || 'Unknown',
      jobTitle: i.application?.title || 'Unknown',
      completed: i.completed,
    }));
  }

  async getRecentActivity(userId: string) {
    const recentApps = await this.applicationRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    return recentApps.map((app) => ({
      type: 'status_change',
      applicationId: app.id,
      title: app.title,
      status: app.status,
      timestamp: app.updatedAt,
    }));
  }
}
