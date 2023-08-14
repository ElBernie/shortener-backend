import { IsEmail, IsStrongPassword } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8 })
  password: string;
}
