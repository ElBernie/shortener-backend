import { IsEmail, IsString } from 'class-validator';

export default class LoginDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
