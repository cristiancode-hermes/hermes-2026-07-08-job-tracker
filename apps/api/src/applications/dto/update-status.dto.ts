import { IsString, IsIn } from 'class-validator';

const VALID_STATUSES = [
  'saved', 'applied', 'screening', 'interview',
  'offer', 'accepted', 'rejected', 'withdrawn',
];

export class UpdateStatusDto {
  @IsString()
  @IsIn(VALID_STATUSES)
  status: string;
}
