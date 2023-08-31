import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import LinksService from './links.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { AllowAnonymous } from '../Auth/decorators/allowanonymous.decorator';
import JwtAuthGuard from '../Auth/guards/JWT.guard';
import { Request as RequestType } from '../types';
import LinkUpdateDTO from './DTO/link-update.dto';
import WorkspacesService from 'src/Workspaces/services/workspaces.service';

@Controller('links')
export default class LinksController {
  constructor(
    private linksService: LinksService,
    private workspacesService: WorkspacesService,
  ) {}

  @Get('/:linkdId')
  getLinkById(@Param('linkId') linkId: string) {
    return this.linksService.getLinkById(linkId);
  }

  @Get('/alias/:alias')
  getLinkByAlias(@Param('alias') alias: string) {
    return this.linksService.getLinkByAlias(alias, { include: { url: true } });
  }

  @Post()
  @AllowAnonymous()
  @UseGuards(JwtAuthGuard)
  async createLink(
    @Request() req: RequestType,
    @Body() linkCreationData: LinkCreationDTO,
  ) {
    if (
      !this.workspacesService.userHasPermission(
        req.user.userId,
        linkCreationData.workspace,
        'linksCreate',
      )
    )
      throw new UnauthorizedException();
    if (req.user?.userId) {
      return this.linksService.createUrl({
        linkData: linkCreationData,
        user: req.user,
        workspaceId: linkCreationData.workspace,
      });
    }

    const existingLink = await this.linksService.getLinkByUrl(
      linkCreationData.url,
    );
    if (existingLink) return existingLink;

    return this.linksService.createUrl({
      linkData: linkCreationData,
    });
  }

  @Patch('/:linkId')
  @UseGuards(JwtAuthGuard)
  async updateLink(
    @Request() req: RequestType,
    @Param('linkId') linkId: string,
    @Body() linkUpdateData: LinkUpdateDTO,
  ) {
    const link = await this.linksService.getLinkById(linkId);
    if (link.userId != req.user.userId) throw new ForbiddenException();

    return this.linksService.updateUrl(linkId, {
      alias: linkUpdateData.newAlias,
      url: linkUpdateData.url,
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
