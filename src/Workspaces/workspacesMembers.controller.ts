import { Controller, Get, Param } from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';

@Controller('/workspaces')
export default class WorkspacesMembersController {
  constructor(
    private worksspacesService: WorkspacesService,
    private workspacesMembersService: WorkspacesMembersServices,
  ) {}

  @Get('/:workspaceId/members')
  test(@Param('workspaceId') workspaceId: string) {
    return this.workspacesMembersService.getWorkspaceMember(workspaceId);
  }
}
