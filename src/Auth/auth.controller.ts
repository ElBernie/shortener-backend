import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterDTO } from './DTO/register.dto';
import AuthService from './auth.service';
import LoginDTO from './DTO/login.dto';

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  registerUser(@Body() userCreateData: RegisterDTO) {
    return this.authService.register(userCreateData);
  }

  @Post('/login')
  logUser(@Body() userLoginData: LoginDTO) {
    return this.authService.login(userLoginData);
  }

  @Get('/validate/:validationToken')
  validateAccount(@Param('validationToken') validationToken: string) {
    return this.authService.validate(validationToken);
  }
}
