import { IsOptional, IsString } from 'class-validator';

export class CompleteInterviewDto {
  @IsOptional()
  @IsString()
  feedback?: string;
}
