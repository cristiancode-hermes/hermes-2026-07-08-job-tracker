import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobApplication } from '../../applications/entities/job-application.entity';

@Entity('ai_analyses')
export class AIAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.analyses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  applicationId: string;

  @ManyToOne(() => JobApplication, (application) => application.analyses)
  @JoinColumn({ name: 'applicationId' })
  application: JobApplication;

  @Column('text')
  resumeText: string;

  @Column()
  matchScore: number;

  @Column('text')
  strengths: string;

  @Column('text')
  gaps: string;

  @Column('text')
  suggestions: string;

  @Column()
  modelUsed: string;

  @CreateDateColumn()
  createdAt: Date;
}
