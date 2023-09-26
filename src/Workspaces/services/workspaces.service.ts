import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesStatsService from 'src/WorkspacesStats/workspacesStats.service';
import { WORKSPACE_PERMISSIONS } from 'src/types';

@Injectable()
export default class WorkspacesService {
  constructor(
    private prismaService: PrismaService,
    private workspacesStatsService: WorkspacesStatsService,
  ) {}

  getWorkspace(workspaceId: string) {
    return this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });
  }
  createWorkspace(userId: string, name: string) {
    if (!userId) throw new UnauthorizedException();
    return this.prismaService.workspace.create({
      data: {
        name,
        ownerId: userId,
        type: 'PROFESSIONAL',
        WorkspaceRoles: {
          create: {
            name: 'Members',
            default: true,
            deletable: false,
          },
        },
      },
    });
  }

  async deleteWorkspace(workspaceId: string) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) throw new NotFoundException();
    if (workspace.deletable == false) throw new ForbiddenException();
    await this.workspacesStatsService.deleteWorkspaceStats(workspaceId);

    return this.prismaService.workspace.delete({
      where: { id: workspaceId },
    });
  }

  async getWorkspaceInvites(workspaceId: string) {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) throw new NotFoundException();

    return this.prismaService.workspaceInvites.findMany({
      where: { workspaceId: workspaceId },
    });
  }

  async userHasPermission(
    userId: string,
    workspaceId: string,
    permission: keyof typeof WORKSPACE_PERMISSIONS,
  ) {
    const usersPermissions = await this.getWorkspacePermissionsForUser(
      userId,
      workspaceId,
    );

    return (
      usersPermissions.includes('*') || usersPermissions.includes(permission)
    );
  }

  async getWorkspacePermissionsForUser(userId: string, workspaceId: string) {
    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
    if (!workspace) throw new NotFoundException('WORKSPACE_NOT_FOUND');

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    if (workspace.ownerId == user.id) return ['*'];

    const workspaceMembership =
      await this.prismaService.workspaceMembers.findFirst({
        where: {
          userId: userId,
          workspaceId: workspaceId,
        },
        include: {
          role: true,
        },
      });

    if (!workspaceMembership) throw new UnauthorizedException();

    const permissions = workspaceMembership.role;
    // sanitizing role data, to get only permissions
    delete permissions.id;
    delete permissions.name;
    delete permissions.deletable;
    delete permissions.default;
    delete permissions.createdAt;
    delete permissions.updatedAt;
    delete permissions.workspaceId;

    const permissionArray = Object.entries(permissions as unknown as boolean[])
      .filter((role) => role[1] !== false)
      .map((role) => role[0]);
    permissionArray.push('member');
    return permissionArray;
    //retour un array des permission du workspace que l'user a
  }
}
