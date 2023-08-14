import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import UsersService from './users.service';
import JwtAuthGuard from 'src/Auth/JWT.guard';

@Controller('users')
export default class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@Req() request) {
    const { userId } = request.user;
    const userData = await this.usersService.getUser(userId);
    return userData;
  }
}
