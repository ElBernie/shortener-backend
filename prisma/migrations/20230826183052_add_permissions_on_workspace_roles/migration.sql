-- AlterTable
ALTER TABLE "WorkspaceRoles" ADD COLUMN     "linksCreate" BOOLEAN DEFAULT false,
ADD COLUMN     "linksDelete" BOOLEAN DEFAULT false,
ADD COLUMN     "linksDeleteOwn" BOOLEAN DEFAULT false,
ADD COLUMN     "linksEdit" BOOLEAN DEFAULT false,
ADD COLUMN     "linksEditOwn" BOOLEAN DEFAULT false,
ADD COLUMN     "linksView" BOOLEAN DEFAULT false,
ADD COLUMN     "linksViewOwn" BOOLEAN DEFAULT false,
ADD COLUMN     "workspaceEdit" BOOLEAN DEFAULT false,
ADD COLUMN     "workspaceMembersEdit" BOOLEAN DEFAULT false,
ADD COLUMN     "workspaceMembersInvite" BOOLEAN DEFAULT false,
ADD COLUMN     "workspaceMembersRemove" BOOLEAN DEFAULT false;
