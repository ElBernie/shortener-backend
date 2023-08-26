export enum WORKSPACE_PERMISSIONS {
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
