import { IsBoolean, IsString, IsOptional, IsObject } from 'class-validator';

export class WorksapcesRolesCreateDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  workspaceEdit?: boolean;
  @IsOptional()
  @IsBoolean()
  workspaceMembersEdit?: boolean;
  @IsOptional()
  @IsBoolean()
  workspaceMembersInvite?: boolean;
  @IsOptional()
  @IsBoolean()
  workspaceMembersRemove?: boolean;

  @IsOptional()
  @IsBoolean()
  linksView?: boolean;
  @IsOptional()
  @IsBoolean()
  linksViewOwn?: boolean;
  @IsOptional()
  @IsBoolean()
  linksCreate?: boolean;
  @IsOptional()
  @IsBoolean()
  linksEdit?: boolean;
  @IsOptional()
  @IsBoolean()
  linksEditOwn?: boolean;
  @IsOptional()
  @IsBoolean()
  linksDelete?: boolean;
  @IsOptional()
  @IsBoolean()
  linksDeleteOwn?: boolean;
}
