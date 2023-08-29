import { IsEmail, IsString } from 'class-validator';

export default class InviteCreateDTO {
  @IsString()
  workspaceId: string;

  @IsEmail()
  email: string;
}
