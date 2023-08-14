import { Controller } from '@nestjs/common';
import UsersService from './users.service';

@Controller('users')
export default class UsersController {
  constructor(private usersService: UsersService) {}
}
