import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { Interview } from './entities/interview.entity';
import { InterviewQuestion } from './entities/interview-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, InterviewQuestion])],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
