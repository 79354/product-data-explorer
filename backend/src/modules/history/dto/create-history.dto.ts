import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateHistoryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  sessionId: string;

  @IsObject()
  pathJson: Record<string, any>;
}
