import {
  BadRequestException,
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
import LinksService from './services/links.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { AllowAnonymous } from '../Auth/decorators/allowanonymous.decorator';
import JwtAuthGuard from '../Auth/guards/JWT.guard';
import { Request as RequestType } from '../types';
import LinkUpdateDTO from './DTO/link-update.dto';
import WorkspacesService from 'src/Workspaces/services/workspaces.service';
import RegisterHitDTO from './DTO/stats-register-hit.dto';
import LinksStatsService from './services/links-stats.service';
import { InfluxClientService } from '@sunbzh/nest-influx';
import { DeleteAPI } from '@influxdata/influxdb-client-apis';

@Controller('links')
export default class LinksController {
  private influxDeleteAPI: DeleteAPI;
  constructor(
    private linksService: LinksService,
    private workspacesService: WorkspacesService,
    private linksStatsService: LinksStatsService,
    private influx: InfluxClientService,
  ) {
    this.influxDeleteAPI = new DeleteAPI(influx.influxDB);
  }

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
    if (req.user?.userId) {
      if (!linkCreationData.workspaceId)
        throw new BadRequestException('MISSING_WORKSPACE_ID');

      if (
        !this.workspacesService.userHasPermission(
          req.user.userId,
          linkCreationData.workspaceId,
          'linksCreate',
        )
      )
        throw new UnauthorizedException();

      return this.linksService.createUrl({
        linkData: linkCreationData,
        userId: req.user.userId,
        workspaceId: linkCreationData.workspaceId,
      });
    } else {
      const existingLink = await this.linksService.getLinkByUrl(
        linkCreationData.url,
      );
      if (existingLink) return existingLink;

      return this.linksService.createUrl({
        linkData: linkCreationData,
      });
    }
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

  @Delete('/:linkId')
  @UseGuards(JwtAuthGuard)
  async deleteLink(
    @Request() req: RequestType,
    @Param('linkId') linkId: string,
  ) {
    const link = await this.linksService.getLinkById(linkId);
    if (
      !this.workspacesService.userHasPermission(
        req.user.userId,
        link.workspaceId,
        'linksDelete',
      ) &&
      !this.workspacesService.userHasPermission(
        req.user.userId,
        link.workspaceId,
        'linksDeleteOwn',
      )
    )
      throw new ForbiddenException();

    if (
      link.userId != req.user.userId &&
      !this.workspacesService.userHasPermission(
        req.user.userId,
        link.workspaceId,
        'linksDelete',
      )
    )
      throw new ForbiddenException();

    await this.influxDeleteAPI.postDelete({
      bucket: 'links',
      org: 'sunbzh',
      body: {
        start: new Date(1970, 1, 1).toISOString(),
        stop: new Date(Date.now()).toISOString(),
        predicate: `linkId="${link.id}"`,
      },
    });

    return this.linksService.deleteUrl(linkId);
  }

  @Get('/:linkId/stats')
  async getLinkStats(@Param('linkId') linkId: string) {
    return this.linksStatsService.getLinkStats(linkId, {
      includes: { langs: true, visits: true },
    });
  }

  @Post('/:linkId/stats')
  async registerHit(
    @Param('linkId') linkId: string,
    @Body() hitData: RegisterHitDTO,
  ) {
    return this.linksStatsService.registerHit(linkId, hitData);
  }
}
