import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { JobApplication } from '../../applications/entities/job-application.entity';
import { Interview } from '../../interviews/entities/interview.entity';
import { CoverLetter } from '../../cover-letters/entities/cover-letter.entity';
import { AIAnalysis } from '../../analysis/entities/ai-analysis.entity';
import { UserSettings } from '../../settings/entities/user-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Company, (company) => company.user)
  companies: Company[];

  @OneToMany(() => JobApplication, (application) => application.user)
  applications: JobApplication[];

  @OneToMany(() => Interview, (interview) => interview.user)
  interviews: Interview[];

  @OneToMany(() => CoverLetter, (coverLetter) => coverLetter.user)
  coverLetters: CoverLetter[];

  @OneToMany(() => AIAnalysis, (analysis) => analysis.user)
  analyses: AIAnalysis[];

  @OneToMany(() => UserSettings, (settings) => settings.user)
  settings: UserSettings[];
}
