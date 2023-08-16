import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import LinksService from './links.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { AllowAnonymous } from 'src/Auth/allowanonymous.metadata';
import JwtAuthGuard from 'src/Auth/JWT.guard';
import { Request as RequestType } from 'src/types';

@Controller('links')
export default class LinksController {
  constructor(private linksService: LinksService) {}
  @Get('/:alias')
  getLink(@Param('alias') alias: string) {
    return this.linksService.getLinkByAlias(alias);
  }

  @Post()
  @AllowAnonymous()
  @UseGuards(JwtAuthGuard)
  createLink(
    @Request() req: RequestType,
    @Body() linkCreationData: LinkCreationDTO,
  ) {
    return this.linksService.createUrl({
      linkData: linkCreationData,
      user: req.user,
    });
  }

  @Delete('/:alias')
  @UseGuards(JwtAuthGuard)
  deleteLink(@Request() req: RequestType, @Param('alias') alias: string) {
    return this.linksService.deleteUrl({
      alias,
      user: req.user,
    });
  }
}
