import { IsUrl } from 'class-validator';

export default class LinkCreationDTO {
  @IsUrl()
  url: string;
}
