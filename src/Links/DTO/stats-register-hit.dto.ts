import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export default class RegisterHitDTO {
  @IsOptional()
  @IsString()
  continentCode?: string;

  @IsOptional()
  @IsString()
  contryCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  long?: number;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
