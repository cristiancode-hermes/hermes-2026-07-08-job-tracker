import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobApplication } from '../../applications/entities/job-application.entity';
import { Company } from '../../companies/entities/company.entity';
import { InterviewQuestion } from './interview-question.entity';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.interviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  applicationId: string;

  @ManyToOne(() => JobApplication, (application) => application.interviews)
  @JoinColumn({ name: 'applicationId' })
  application: JobApplication;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.interviews)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  type: string;

  @Column()
  dateTime: Date;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  prepNotes: string;

  @Column({ nullable: true })
  feedback: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InterviewQuestion, (question) => question.interview)
  questions: InterviewQuestion[];
}
