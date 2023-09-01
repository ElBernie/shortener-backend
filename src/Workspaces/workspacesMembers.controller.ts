import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';
import InviteCreateDTO from './DTO/invite-create.dto';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import Permission from 'src/Auth/decorators/permission.decorator';
import { Request } from 'src/types';
import UsersService from 'src/Users/users.service';

@Controller('/workspaces')
export default class WorkspacesMembersController {
  constructor(
    private worksspacesService: WorkspacesService,
    private workspacesMembersService: WorkspacesMembersServices,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Permission('member')
  @Get('/:workspaceId/members')
  async getMembers(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspacesMembersService.getWorkspaceMembers(workspaceId);
  }

  @Permission('member')
  @Get('/:workspaceId/members/:userId/role')
  getMemberRole(@Param() params: { workspaceId: string; userId: string }) {
    const { workspaceId, userId } = params;
    return this.workspacesMembersService.getWorkspaceMemberRole(
      workspaceId,
      userId,
    );
  }

  @Permission('workspaceMembersEdit')
  @Patch('/:workspaceId/members/:userId/role')
  updateMemberRole(
    @Param() params: { workspaceId: string; userId: string; roleId: string },
  ) {
    const { workspaceId, userId, roleId } = params;
    return this.workspacesMembersService.switchWorkspaceMemberRole(
      workspaceId,
      userId,
      roleId,
    );
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
  @Get('/:workspaceId/invites')
  getInvites(@Param('workspaceId') workspaceId: string) {
    return this.worksspacesService.getWorkspaceInvites(workspaceId);
  }

  @Permission('workspaceMembersInvite')
  @Get('/:workspaceId/invites/:inviteId')
  async getInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
  ) {
    const invite = await this.workspacesMembersService.getInvite(inviteId);
    if (!invite) throw new NotFoundException('INVITE_NOT_FOUND');
    if (invite.workspaceId != workspaceId) throw new ForbiddenException();

    return invite;
  }

  @Permission('workspaceMembersInvite')
  @Post('/:workspaceId/invites')
  async createInvite(
    @Req() req: Request,
    @Body() inviteCreate: InviteCreateDTO,
  ) {
    const invitingUser = await this.usersService.getUser(req.user.userId);
    if (!invitingUser) throw new UnauthorizedException();

    if (inviteCreate.email == invitingUser.email)
      throw new ConflictException('USER_CANT_INVITE_HIMSELF');

    return this.workspacesMembersService.inviteMember(
      inviteCreate.workspaceId,
      inviteCreate.email,
    );
  }

  @Permission('workspaceMembersInvite')
  @Delete('/:workspaceId/invite/:inviteId')
  async deleteInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
  ) {
    const invite = await this.workspacesMembersService.getInvite(inviteId);
    if (!invite) throw new NotFoundException('INVITE_NOT_FOUND');
    if (invite.workspaceId != workspaceId) throw new ForbiddenException();

    return this.workspacesMembersService.deleteInvite(inviteId);
  }
}
