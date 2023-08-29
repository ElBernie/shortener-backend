import { Controller, Delete, Get, Param } from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';

@Controller('/workspaces')
export default class WorkspacesMembersController {
  constructor(
    private worksspacesService: WorkspacesService,
    private workspacesMembersService: WorkspacesMembersServices,
  ) {}

  @Get('/:workspaceId/members')
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesMembersService.getWorkspaceMember(workspaceId);
  }

  @Delete('/:workspaceId/members/:userId')
  removeMember(@Param() params: { workspaceId: string; userId: string }) {
    return this.workspacesMembersService.deleteWorkspaceMember(
      params.workspaceId,
      params.userId,
    );
  }
}
