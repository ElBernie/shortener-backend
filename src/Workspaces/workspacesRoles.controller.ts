import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import Permission from 'src/Auth/decorators/permission.decorator';
import { WorkspacesRolesCreateDTO } from './DTO/role-create';
import WorkspacesRolesService from './services/workspacesRoles.service';
import RoleUpdateDTO from './DTO/role-update.dtos';

@Controller('/workspaces/:workspaceId/roles')
export default class WorkspacesRolesController {
  constructor(private rolesService: WorkspacesRolesService) {}

  @Permission('member')
  @Get('/')
  async getWorkspaceRoles(@Param('workspaceId') workspaceId: string) {
    return this.rolesService.getWorkspaceRoles(workspaceId);
  }

  @Permission('workspaceEdit')
  @Post('/')
  async createWorkspaceRole(
    @Param('workspaceId') workspaceId: string,
    @Body() params: WorkspacesRolesCreateDTO,
  ) {
    const { name, ...permissions } = params;
    return this.rolesService.createRole({
      workspaceId: workspaceId,
      name: name,
      permissions: permissions,
    });
  }

  @Permission('workspaceEdit')
  @Patch('/:roleId')
  async updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('roleId') roleId: string,
    @Body() updateData: RoleUpdateDTO,
  ) {
    const { name, permissions } = updateData;
    return this.rolesService.updateRole(roleId, { name }, permissions);
  }
}
