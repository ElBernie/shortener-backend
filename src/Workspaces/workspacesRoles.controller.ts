import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import Permission from 'src/Auth/decorators/permission.decorator';
import { WorksapcesRolesCreateDTO } from './DTO/workpacesroles-create.dto';
import WorkspacesRolesService from './services/workspacesRoles.service';

@Controller('/:workspaceId/roles')
export default class WorkspacesRolesController {
  constructor(private rolesService: WorkspacesRolesService) {}

  @Permission('member')
  @Get('/:workspaceId/roles')
  async getWorkspaceRoles(@Param('workspaceId') workspaceId: string) {
    return this.rolesService.getWorkspaceRoles(workspaceId);
  }

  @Permission('workspaceEdit')
  @Post('/')
  async createWorkspaceRole(
    @Param('workspaceId') workspaceId: string,
    @Body() params: WorksapcesRolesCreateDTO,
  ) {
    const { name, ...permissions } = params;
    return this.rolesService.createRole({
      workspaceId: workspaceId,
      name: name,
      permissions: permissions,
    });
  }
}
