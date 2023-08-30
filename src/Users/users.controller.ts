import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import UsersService from './users.service';
import JwtAuthGuard from 'src/Auth/guards/JWT.guard';
import { Request } from 'src/types';

@Controller('users')
export default class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@Req() request: any) {
    const { userId } = request.user;
    const userData = await this.usersService.getUser(userId);

    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me/workspaces')
  async getUserWorkspaces(@Req() request: Request) {
    const { userId } = request.user;
    return this.usersService.getUserWorkspaces(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me/invites')
  async getUserInvites(@Req() request: Request) {
    const { userId } = request.user;
    return this.usersService.getUserInvites(userId);
  }
}
