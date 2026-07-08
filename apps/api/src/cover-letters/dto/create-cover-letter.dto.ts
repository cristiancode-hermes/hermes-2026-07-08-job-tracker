import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateCoverLetterDto {
  @IsString()
  applicationId: string;

  @IsString()
  content: string;

  @IsString()
  @IsIn(['formal', 'enthusiastic', 'professional'])
  tone: string;

  @IsString()
  @IsIn(['short', 'medium', 'long'])
  length: string;
}
