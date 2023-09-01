import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { WorkspacesRolePermissions } from 'src/types';

class Permissions {
  @IsOptional()
  @IsBoolean()
  workspaceEdit: boolean;

  @IsOptional()
  @IsBoolean()
  workspaceMembersEdit: boolean;

  @IsOptional()
  @IsBoolean()
  workspaceMembersInvite: boolean;

  @IsOptional()
  @IsBoolean()
  workspaceMembersRemove: boolean;

  @IsOptional()
  @IsBoolean()
  linksView: boolean;

  @IsOptional()
  @IsBoolean()
  linksViewOwn: boolean;

  @IsOptional()
  @IsBoolean()
  linksCreate: boolean;

  @IsOptional()
  @IsBoolean()
  linksEdit: boolean;

  @IsOptional()
  @IsBoolean()
  linksEditOwn: boolean;

  @IsOptional()
  @IsBoolean()
  linksDelete: boolean;

  @IsOptional()
  @IsBoolean()
  linksDeleteOwn: boolean;
}

export default class RoleUpdateDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Permissions)
  permissions: Partial<Omit<WorkspacesRolePermissions, 'owner' | 'member'>>;
}
