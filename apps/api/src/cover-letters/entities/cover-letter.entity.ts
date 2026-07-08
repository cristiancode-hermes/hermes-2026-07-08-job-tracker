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

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.coverLetters)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  applicationId: string;

  @ManyToOne(() => JobApplication, (application) => application.coverLetters)
  @JoinColumn({ name: 'applicationId' })
  application: JobApplication;

  @Column('text')
  content: string;

  @Column()
  tone: string;

  @Column()
  length: string;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;
}
