import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export default class WorkspacesMembersServices {
  constructor(private prisma: PrismaService) {}

  async getWorkspaceMember(workspaceId: string) {
    const workspaceOwner = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },

      select: {
        owner: true,
      },
    });
    console.log(workspaceOwner);

    const members = await this.prisma.workspaceMembers.findMany({
      where: { workspaceId: workspaceId },

      select: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      owner: workspaceOwner.owner,
      members: members.map((users) => {
        return users.user;
      }),
    };
  }

  async deleteWorkspaceMember(workspaceId: string, userId: string) {
    const workspaceMembership = await this.prisma.workspaceMembers.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });
    if (!workspaceMembership) throw new NotFoundException();

    return this.prisma.workspaceMembers.delete({
      where: {
        id: workspaceMembership.id,
      },
    });
  }
}
