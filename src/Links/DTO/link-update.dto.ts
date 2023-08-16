import { IsOptional, IsString, IsUrl } from 'class-validator';

export default class LinkUpdateDTO {
  @IsOptional()
  @IsString()
  newAlias?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
