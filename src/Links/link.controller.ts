import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import LinksService from './links.service';
import LinkCreationDTO from './DTO/link-creation.dto';

@Controller('links')
export default class LinksController {
  constructor(private linksService: LinksService) {}

  @Get('/:alias')
  getLink(@Param('alias') alias: string) {
    return this.linksService.getLinkByAlias(alias);
  }
  @Post()
  createLink(@Body() linkCreationData: LinkCreationDTO) {
    return this.linksService.createUrl(linkCreationData);
  }
}
