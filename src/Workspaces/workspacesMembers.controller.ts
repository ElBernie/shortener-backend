import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';
import InviteCreateDTO from './DTO/invite-create.dto';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import Permission from 'src/Auth/decorators/permission.decorator';

@Controller('/workspaces')
export default class WorkspacesMembersController {
  constructor(
    private worksspacesService: WorkspacesService,
    private workspacesMembersService: WorkspacesMembersServices,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:workspaceId/members')
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesMembersService.getWorkspaceMember(workspaceId);
  }

  @Permission('workspaceMembersRemove')
  @Delete('/:workspaceId/members/:userId')
  removeMember(@Param() params: { workspaceId: string; userId: string }) {
    return this.workspacesMembersService.deleteWorkspaceMember(
      params.workspaceId,
      params.userId,
    );
  }

  @Permission('workspaceMembersInvite')
  @Post('/:workspaceId/invites')
  createInvite(@Body() inviteCreate: InviteCreateDTO) {
    return this.workspacesMembersService.inviteMember(
      inviteCreate.workspaceId,
      inviteCreate.email,
    );
  }
}
