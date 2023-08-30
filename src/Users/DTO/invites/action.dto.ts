import { IsIn, IsString } from 'class-validator';

export default class InvitesActionDTO {
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'])
  action: 'ACCEPT' | 'REJECT';
}
