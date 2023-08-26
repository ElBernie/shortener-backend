import { IsOptional, IsString, IsUrl } from 'class-validator';

export default class LinkCreationDTO {
  @IsOptional()
  @IsString()
  alias?: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  workspace: string;
}
