import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { WorkspacesRolePermissions } from 'src/types';

interface WorkspaceRoleCreate {
  workspaceId: string;
  name: string;
  permissions: WorkspacesRolePermissions;
  deletable?: boolean;
  defaultWorkspace?: boolean;
}

@Injectable()
export default class WorkspacesRolesService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaceRoles(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) throw new NotFoundException('WORKSPACE_NOT_FOUND');
    return this.prisma.workspaceRoles.findMany({
      where: { workspaceId: workspaceId },
    });
  }

  async createRole({
    workspaceId,
    name,
    deletable,
    defaultWorkspace,
    permissions,
  }: WorkspaceRoleCreate) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) throw new NotFoundException('WORKSPACE_NOT_FOUND');

    return this.prisma.workspaceRoles.create({
      data: {
        workspaceId: workspaceId,
        name: name,
        default: defaultWorkspace,
        deletable: deletable,
        ...permissions,
      },
    });
  }
}