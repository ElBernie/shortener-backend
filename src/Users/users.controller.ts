import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import UsersService from './users.service';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import { Request } from 'src/types';
import InvitesActionDTO from './DTO/invites/action.dto';

@Controller('users')
export default class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  async getUser(@Req() request: any, @Param('userId') requestedUserId: string) {
    const { userId } = request.user;
    if (requestedUserId == userId)
      return this.usersService.getUser(requestedUserId);

    return this.usersService.getUser(requestedUserId, { remove: ['email'] });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/workspaces')
  async getUserWorkspaces(
    @Req() request: Request,
    @Param('userId') requestedUserId: string,
  ) {
    const { userId } = request.user;
    if (requestedUserId != userId) throw new ForbiddenException();
    return this.usersService.getUserWorkspaces(requestedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/invites')
  async getUserInvites(
    @Req() request: Request,
    @Param('userId') requestedUserId: string,
  ) {
    const { userId } = request.user;
    if (requestedUserId != userId) throw new ForbiddenException();
    return this.usersService.getUserInvites(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:userId/invites/:inviteId')
  async inviteAction(
    @Req() request: Request,
    @Param('userId') requestedUserId: string,
    @Param('inviteId') inviteId: string,
    @Body() action: InvitesActionDTO,
  ) {
    const { userId } = request.user;

    if (requestedUserId != userId) throw new ForbiddenException();
    const payload = {
      inviteId,
      userId: requestedUserId,
    };

    return action.action === 'ACCEPT'
      ? this.usersService.acceptInvite(payload)
      : this.usersService.rejectInvite(payload);
  }
}
