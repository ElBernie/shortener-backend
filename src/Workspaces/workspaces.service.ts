import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { WORKSPACE_PERMISSIONS } from 'src/types';

@Injectable()
export default class WorkspacesService {
  constructor(private prismaService: PrismaService) {}

  createWorkspace(userId: string, name: string) {
    if (!userId) throw new UnauthorizedException();
    return this.prismaService.workspace.create({
      data: {
        name,
        ownerId: userId,
      },
    });
  }

  async getWorkspaces({ userId }: { userId: string }) {
    return this.prismaService.workspace.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            WorkspaceMembers: {
              every: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        WorkspaceMembers: {
          where: {
            userId: userId,
          },
          include: {
            role: true,
          },
        },
      },
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

    return Object.entries(permissions as unknown as boolean[])
      .filter((role) => role[1] !== false)
      .map((role) => role[0]);
    //retour un array des permission du workspace que l'user a
  }
}
