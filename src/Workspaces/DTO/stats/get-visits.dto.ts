import { IsOptional, IsString } from 'class-validator';

export default class WorkspaceStatsGetVisitsDTO {
  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsString()
  interval?: string;
}
