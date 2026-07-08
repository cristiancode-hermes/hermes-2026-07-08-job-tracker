import { IsOptional, IsString } from 'class-validator';

export class GenerateLetterDto {
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  length?: string;
}
