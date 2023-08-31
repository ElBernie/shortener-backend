import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesCreate from 'src/Workspaces/DTO/workspaces-create.dto';
import { Request } from 'src/types';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import { WorksapcesRolesCreateDTO } from './DTO/workpacesroles-create.dto';
import Permission from 'src/Auth/decorators/permission.decorator';
import WorkspacesRolesService from './services/workspacesRoles.service';
import LinksService from 'src/Links/links.service';

@Controller('/workspaces')
export default class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private workspacesRolesService: WorkspacesRolesService,
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
  ) {
    const { userId } = req.user;
    const usersPermissions =
      await this.workspacesService.getWorkspacePermissionsForUser(
        userId,
        workspaceId,
      );

    if (
      !usersPermissions.includes('linksView') ||
      !usersPermissions.includes('linksViewOwn') ||
      !usersPermissions.includes('owner')
    )
      throw new ForbiddenException();

    if (
      usersPermissions.includes('linksView') ||
      usersPermissions.includes('owner')
    )
      // linksView // linksViewOwn// owner
      return this.linksService.getLinks({
        where: { workspaceId: workspaceId },
      });

    return this.linksService.getLinks({
      where: { workspaceId: workspaceId, userId: userId },
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
