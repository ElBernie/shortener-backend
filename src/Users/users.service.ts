import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export default class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException();
    delete user.email;
    delete user.password;

    return user;
  }

  async getUserWorkspaces(userId: string) {
    const ownedWorkspaces = await this.prismaService.workspace.findMany({
      where: {
        ownerId: userId,
      },
    });

    const ownedWorkspacesId = ownedWorkspaces.map((workspace) => workspace.id);

    const workspacesMembership =
      await this.prismaService.workspaceMembers.findMany({
        where: {
          userId: userId,
          id: {
            notIn: ownedWorkspacesId,
          },
        },
      });

    return { owned: ownedWorkspaces, member: workspacesMembership };
  }

  async getUserInvites(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException();

    return await this.prismaService.workspaceInvites.findMany({
      where: {
        email: user.email,
      },
      include: {
        workspace: true,
      },
    });
  }
}
