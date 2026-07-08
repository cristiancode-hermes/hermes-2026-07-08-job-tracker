import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';

@Entity('interview_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  interviewId: string;

  @ManyToOne(() => Interview, (interview) => interview.questions)
  @JoinColumn({ name: 'interviewId' })
  interview: Interview;

  @Column()
  question: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ default: 0 })
  sortOrder: number;
}
