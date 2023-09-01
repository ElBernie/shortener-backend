import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceRoles } from '@prisma/client';

import { PrismaService } from 'src/Prisma/prisma.service';
import { WORKSPACE_PERMISSIONS, WorkspacesRolePermissions } from 'src/types';

interface WorkspaceRoleCreate {
  workspaceId: string;
  name: string;
  permissions: WorkspacesRolePermissions;
  deletable?: boolean;
  defaultRole?: boolean;
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
    defaultRole,
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
        default: defaultRole,
        deletable: deletable,
        ...permissions,
      },
    });
  }

  async updateRole(
    roleId: string,
    settings: Partial<{
      name: string;
      deletable: boolean;
      default: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>,
    permissions: Omit<WorkspacesRolePermissions, 'owner' | 'member'>,
  ) {
    const role = await this.prisma.workspaceRoles.findUnique({
      where: { id: roleId },
    });
    if (!role) throw new NotFoundException();

    return this.prisma.workspaceRoles.update({
      where: { id: roleId },
      data: {
        ...settings,
        ...permissions,
      },
    });
  }
}
