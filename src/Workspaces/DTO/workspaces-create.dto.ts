import { IsString } from 'class-validator';

export default class WorkspacesCreate {
  @IsString()
  name: string;
}
