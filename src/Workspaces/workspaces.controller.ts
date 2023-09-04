import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesCreate from 'src/Workspaces/DTO/workspaces-create.dto';
import { Request } from 'src/types';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import Permission from 'src/Auth/decorators/permission.decorator';
import LinksService from 'src/Links/links.service';

@Controller('/workspaces')
export default class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private linksService: LinksService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createWorkspace(@Req() req: Request, @Body() params: WorkspacesCreate) {
    if (!req.user.userId) throw new UnauthorizedException();
    return this.workspacesService.createWorkspace(req.user.userId, params.name);
  }

  @Get('/:workspaceId')
  async getWorkspace(@Param('workspaceId') workspaceId: string) {
    const workspace = await this.workspacesService.getWorkspace(workspaceId);
    if (!workspace) throw new NotFoundException('WORKSPACE_NOT_FOUND');
    return workspace;
  }

  @Permission('owner')
  @Delete('/:workspaceId')
  deleteWorkspace(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
  ) {
    if (!req.user.userId) throw new UnauthorizedException();
    return this.workspacesService.deleteWorkspace(workspaceId, req.user.userId);
  }

  @Permission('member')
  @Get('/:workspaceId/links')
  async getWorkspaceLinks(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Query()
    query: { [key: string]: string },
  ) {
    console.log(query);
    const { userId } = req.user;
    const includeList = query.include ? query.include.split(',') : [];
    console.log('includeList', includeList);
    const usersPermissions =
      await this.workspacesService.getWorkspacePermissionsForUser(
        userId,
        workspaceId,
      );

    if (
      !(
        !usersPermissions.includes('linksView') ||
        !usersPermissions.includes('linksViewOwn') ||
        !usersPermissions.includes('*')
      )
    )
      throw new ForbiddenException();

    if (
      usersPermissions.includes('linksView') ||
      usersPermissions.includes('*')
    )
      // linksView // linksViewOwn// owner
      return this.linksService.getLinks({
        where: { workspaceId: workspaceId },
        include: {
          ...(includeList.includes('URL') && { URL: true }),
          ...(includeList.includes('workspace') && { workspace: true }),
          ...(includeList.includes('domain') && { Domain: true }),
          ...(includeList.includes('user') && { user: true }),
        },
      });

    return this.linksService.getLinks({
      where: { workspaceId: workspaceId, userId: userId },
      include: {
        ...(includeList.includes('URL') && { URL: true }),
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/permissions/:user')
  getPermissionsForUser(
    @Param('id') workspaceId: string,
    @Param('user') userId: string,
  ) {
    return this.workspacesService.getWorkspacePermissionsForUser(
      userId,
      workspaceId,
    );
  }
}
