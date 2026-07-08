import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  applicationId: string;

  @IsString()
  @IsIn(['phone', 'technical', 'behavioral', 'onsite', 'video'])
  type: string;

  @IsDateString()
  dateTime: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
