import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  resumeText: string;

  @Column({ default: 'system' })
  theme: string;

  @Column({ nullable: true })
  preferences: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
