import { IsEmail, IsStrongPassword } from 'class-validator';

export class UserCreateDTO {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8 })
  password: string;
}
