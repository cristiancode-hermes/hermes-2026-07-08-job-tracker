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
import { Company } from '../../companies/entities/company.entity';
import { Interview } from '../../interviews/entities/interview.entity';
import { CoverLetter } from '../../cover-letters/entities/cover-letter.entity';
import { AIAnalysis } from '../../analysis/entities/ai-analysis.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.applications)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  salary: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'saved' })
  status: string;

  @Column({ nullable: true })
  resumeText: string;

  @Column({ nullable: true })
  appliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Interview, (interview) => interview.application)
  interviews: Interview[];

  @OneToMany(() => CoverLetter, (coverLetter) => coverLetter.application)
  coverLetters: CoverLetter[];

  @OneToMany(() => AIAnalysis, (analysis) => analysis.application)
  analyses: AIAnalysis[];
}
