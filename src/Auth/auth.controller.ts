import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDTO } from './DTO/register.dto';
import AuthService from './auth.service';

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  registerUser(@Body() userCreateData: RegisterDTO) {
    return this.authService.register(userCreateData);
  }
}
