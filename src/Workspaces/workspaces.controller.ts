import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import WorkspacesService from './workspaces.service';
import WorkspacesCreate from 'src/Workspaces/DTO/workspaces-create.dto';
import { Request } from 'src/types';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import { WorksapcesRolesCreateDTO } from './DTO/workpacesroles-create.dto';
import WorkspacesRolesService from './workspacesRoles.service';
import Permission from 'src/Auth/decorators/permission.decorator';

@Controller('/workspaces')
export default class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private workspacesRolesService: WorkspacesRolesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createWorkspace(@Req() req: Request, @Body() params: WorkspacesCreate) {
    if (!req.user.userId) throw new UnauthorizedException();
    return this.workspacesService.createWorkspace(req.user.userId, params.name);
  }

  @UseGuards(JwtAuthGuard)
  @Permission('workspaceEdit')
  @Post('/:workspaceId/roles')
  async createWorkspaceRole(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Body() params: WorksapcesRolesCreateDTO,
  ) {
    //todo check
    // const userHasPermissionToCreateRole =
    //   await this.workspacesService.userHasPermission(
    //     req.user.userId,
    //     workspaceId,
    //     'workspaceEdit',
    //   );

    // if (!userHasPermissionToCreateRole) throw new UnauthorizedException();
    const { name, ...permissions } = params;
    return this.workspacesRolesService.createRole({
      workspaceId: workspaceId,
      name: name,
      permissions: permissions,
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
