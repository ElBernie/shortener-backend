import { Request as ExpressRequest } from 'express';
import { JwtPayload } from './Auth/JWT.strategy';

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type Request = ExpressRequest & {
  user?: JwtPayload;
};

export enum WORKSPACE_PERMISSIONS {
  /**
   * Virtual permissions, not stored in DB
   */
  owner = 'owner',
  member = 'member',

  /*
    Permissions stored in DB
  */
  workspaceEdit = 'workspaceEdit',
  workspaceMembersEdit = 'workspaceMembersEdit',
  workspaceMembersInvite = 'workspaceMembersInvite',
  workspaceMembersRemove = 'workspaceMembersRemove',

  linksView = 'linksView',
  linksViewOwn = 'linksViewOwn',
  linksCreate = 'linksCreate',
  linksEdit = 'linksEdit',
  linksEditOwn = 'linksEditOwn',
  linksDelete = 'linksDelete',
  linksDeleteOwn = 'linksDeleteOwn',
}
export type WorkspacesRolePermissions = Partial<
  Record<WORKSPACE_PERMISSIONS, boolean>
>;

export enum Errors {
  InsufficientPermissions = 'INSUFFICIENT_PERMISSIONS',
  NotFound = 'NOT_FOUND',
}
