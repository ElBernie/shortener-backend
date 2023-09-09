import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
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
import { InfluxClientService } from '@sunbzh/nest-influx';
import { Point, WriteApi } from '@influxdata/influxdb-client';
import RegisterHitDTO from './DTO/stats-register-hit.dto';

@Controller('links')
export default class LinksController {
  private influxWrite: WriteApi;
  constructor(
    private linksService: LinksService,
    private workspacesService: WorkspacesService,
    private influxService: InfluxClientService,
  ) {
    this.influxWrite = this.influxService.getWriteApi('sunbzh', 'links');
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
    if (link.userId != req.user.userId) throw new ForbiddenException();

    return this.linksService.deleteUrl(linkId);
  }

  @Post('/:linkId/stats')
  async registerHit(
    @Param('linkId') linkId: string,
    @Body() hitData: RegisterHitDTO,
  ) {
    const link = await this.linksService.getLinkById(linkId);
    if (!link) throw new NotFoundException();

    const hitPoint = new Point('linkHit')
      .tag('linkId', linkId)
      .tag('workspaceId', link.workspaceId)
      .tag('URLId', link.URLId)
      .tag('host', link.host);

    console.log('hitdata', hitData);
    Object.entries(hitData).forEach((data) => {
      if (data[0] == 'lat' || data[0] == 'lon')
        hitPoint.floatField(data[0], data[1]);
      hitPoint.stringField(data[0], data[1]);
    });

    return this.influxWrite.writePoint(hitPoint);
  }
}
