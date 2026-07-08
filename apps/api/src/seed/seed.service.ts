import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { JobApplication } from '../applications/entities/job-application.entity';
import { Interview } from '../interviews/entities/interview.entity';
import { InterviewQuestion } from '../interviews/entities/interview-question.entity';
import { CoverLetter } from '../cover-letters/entities/cover-letter.entity';
import { AIAnalysis } from '../analysis/entities/ai-analysis.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(CoverLetter)
    private coverLetterRepository: Repository<CoverLetter>,
    @InjectRepository(AIAnalysis)
    private analysisRepository: Repository<AIAnalysis>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count > 0) {
      return; // Already seeded
    }
    await this.seed();
  }

  async seed() {
    // Create 2 demo users
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = this.userRepository.create({
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice Johnson',
    });
    const u1 = await this.userRepository.save(user1);

    const user2 = this.userRepository.create({
      email: 'bob@example.com',
      passwordHash,
      name: 'Bob Smith',
    });
    const u2 = await this.userRepository.save(user2);

    // Create settings
    await this.settingsRepository.save(
      this.settingsRepository.create({
        userId: u1.id,
        theme: 'light',
        resumeText: 'Experienced software engineer with 5 years of full-stack development...',
      }),
    );
    await this.settingsRepository.save(
      this.settingsRepository.create({
        userId: u2.id,
        theme: 'dark',
        resumeText: 'Product manager with expertise in agile methodologies...',
      }),
    );

    // Create 5 companies for user1
    const companyData = [
      { name: 'Acme Corp', website: 'https://acme.com', location: 'San Francisco, CA' },
      { name: 'Beta Inc', website: 'https://beta.io', location: 'New York, NY' },
      { name: 'Gamma LLC', website: 'https://gamma.tech', location: 'Austin, TX' },
      { name: 'Delta Tech', website: 'https://delta.dev', location: 'Seattle, WA' },
      { name: 'Epsilon Solutions', website: 'https://epsilon.com', location: 'Chicago, IL' },
    ];

    const companies: Company[] = [];
    for (const data of companyData) {
      const company = this.companyRepository.create({
        ...data,
        userId: u1.id,
      });
      companies.push(await this.companyRepository.save(company));
    }

    // Create 8+ applications for user1
    const appData = [
      {
        companyId: companies[0].id,
        title: 'Senior Software Engineer',
        description: 'Build scalable backend services using Node.js and TypeScript.',
        salary: '$150k-$180k',
        location: 'San Francisco, CA',
        url: 'https://acme.com/careers/sse',
        status: 'saved',
      },
      {
        companyId: companies[1].id,
        title: 'Full Stack Developer',
        description: 'Work on our main product using React and NestJS.',
        salary: '$130k-$160k',
        location: 'New York, NY',
        url: 'https://beta.io/jobs/fsd',
        status: 'applied',
        appliedAt: new Date('2026-06-28'),
      },
      {
        companyId: companies[2].id,
        title: 'Backend Engineer',
        description: 'Design and implement microservices architecture.',
        salary: '$140k-$170k',
        location: 'Austin, TX',
        url: 'https://gamma.tech/careers/be',
        status: 'screening',
      },
      {
        companyId: companies[3].id,
        title: 'DevOps Engineer',
        description: 'Manage CI/CD pipelines and cloud infrastructure.',
        salary: '$145k-$175k',
        location: 'Seattle, WA',
        url: 'https://delta.dev/jobs/devops',
        status: 'interview',
      },
      {
        companyId: companies[4].id,
        title: 'Software Development Manager',
        description: 'Lead a team of 5-8 engineers building our platform.',
        salary: '$180k-$220k',
        location: 'Chicago, IL',
        url: 'https://epsilon.com/careers/sdm',
        status: 'offer',
      },
      {
        companyId: companies[0].id,
        title: 'Frontend Developer',
        description: 'Build beautiful UIs with React and Tailwind CSS.',
        salary: '$120k-$150k',
        location: 'San Francisco, CA',
        status: 'rejected',
      },
      {
        companyId: companies[1].id,
        title: 'Platform Engineer',
        description: 'Build internal tools and developer platforms.',
        salary: '$140k-$170k',
        location: 'New York, NY',
        status: 'withdrawn',
      },
      {
        companyId: companies[2].id,
        title: 'Junior Developer',
        description: 'Entry-level position for recent graduates.',
        salary: '$80k-$100k',
        location: 'Austin, TX',
        status: 'accepted',
      },
    ];

    const apps: JobApplication[] = [];
    for (const data of appData) {
      const app = this.applicationRepository.create({
        ...data,
        userId: u1.id,
        company: { id: data.companyId },
      });
      apps.push(await this.applicationRepository.save(app));
    }

    // Create 3 interviews
    const interview1 = await this.interviewRepository.save(
      this.interviewRepository.create({
        userId: u1.id,
        applicationId: apps[3].id,
        companyId: companies[3].id,
        type: 'technical',
        dateTime: new Date('2026-07-15T10:00:00Z'),
        contactName: 'Jane Engineer',
        contactEmail: 'jane@delta.dev',
        notes: 'System design round with the team lead',
        completed: false,
      }),
    );

    const interview2 = await this.interviewRepository.save(
      this.interviewRepository.create({
        userId: u1.id,
        applicationId: apps[3].id,
        companyId: companies[3].id,
        type: 'behavioral',
        dateTime: new Date('2026-07-18T14:00:00Z'),
        contactName: 'Mike Manager',
        notes: 'Cultural fit round',
        completed: false,
      }),
    );

    const interview3 = await this.interviewRepository.save(
      this.interviewRepository.create({
        userId: u1.id,
        applicationId: apps[4].id,
        companyId: companies[4].id,
        type: 'onsite',
        dateTime: new Date('2026-07-05T09:00:00Z'),
        contactName: 'Sarah Director',
        contactEmail: 'sarah@epsilon.com',
        notes: 'On-site interview with the team',
        completed: true,
        feedback: 'Strong candidate, moving to offer stage.',
      }),
    );

    // Create interview questions
    await this.questionRepository.save([
      this.questionRepository.create({
        interviewId: interview1.id,
        question: 'Design a rate-limiting system for a distributed API.',
        sortOrder: 1,
      }),
      this.questionRepository.create({
        interviewId: interview1.id,
        question: 'Explain how you would scale a Node.js application.',
        sortOrder: 2,
      }),
      this.questionRepository.create({
        interviewId: interview3.id,
        question: 'How do you handle conflict in a team?',
        sortOrder: 1,
      }),
      this.questionRepository.create({
        interviewId: interview3.id,
        question: 'Describe a project you led from start to finish.',
        sortOrder: 2,
        answer: 'I led the migration of a monolith to microservices...',
      }),
    ]);

    // Create AI analyses
    const analysis1 = this.analysisRepository.create({
      userId: u1.id,
      applicationId: apps[0].id,
      resumeText: 'Experienced software engineer with 5 years...',
      matchScore: 85,
      strengths: JSON.stringify(['Node.js', 'TypeScript', 'System Design']),
      gaps: JSON.stringify(['Kubernetes', 'GraphQL']),
      suggestions: JSON.stringify(['Highlight your Node.js experience', 'Add Kubernetes skills']),
      modelUsed: 'local-fallback',
    });
    await this.analysisRepository.save(analysis1);

    const analysis2 = this.analysisRepository.create({
      userId: u1.id,
      applicationId: apps[2].id,
      resumeText: 'Experienced software engineer with 5 years...',
      matchScore: 72,
      strengths: JSON.stringify(['Microservices', 'API Design']),
      gaps: JSON.stringify(['Docker', 'AWS']),
      suggestions: JSON.stringify(['Get AWS certified', 'Learn Docker']),
      modelUsed: 'local-fallback',
    });
    await this.analysisRepository.save(analysis2);

    // Create cover letters
    const cl1 = this.coverLetterRepository.create({
      userId: u1.id,
      applicationId: apps[0].id,
      content: 'Dear Hiring Manager,\\n\\nI am excited to apply for the Senior Software Engineer position at Acme Corp. With my extensive experience in Node.js and TypeScript...\\n\\nSincerely,\\nAlice Johnson',
      tone: 'professional',
      length: 'medium',
    });
    await this.coverLetterRepository.save(cl1);

    const cl2 = this.coverLetterRepository.create({
      userId: u1.id,
      applicationId: apps[1].id,
      content: 'Dear Team at Beta Inc,\\n\\nI am thrilled to apply for the Full Stack Developer role...\\n\\nBest regards,\\nAlice Johnson',
      tone: 'enthusiastic',
      length: 'short',
    });
    await this.coverLetterRepository.save(cl2);

    console.log('Seed data created successfully!');
  }
}
