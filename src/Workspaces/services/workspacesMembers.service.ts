import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export default class WorkspacesMembersService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaceMembers(workspaceId: string) {
    const workspaceOwner = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },

      select: {
        owner: true,
      },
    });

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

  async getWorkspaceMemberRole(workspaceId: string, userId: string) {
    const workspaceMembership = await this.prisma.workspaceMembers.findFirst({
      where: {
        workspaceId: workspaceId,
        userId: userId,
      },
      include: {
        role: true,
      },
    });

    if (!workspaceMembership) throw new NotFoundException();
    return workspaceMembership;
  }

  async switchWorkspaceMemberRole(
    workspaceId: string,
    userId: string,
    roleId: string,
  ) {
    const workspaceMembership = await this.prisma.workspaceMembers.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });
    if (!workspaceMembership) throw new NotFoundException();

    const roleExists = await this.prisma.workspaceRoles.findFirst({
      where: {
        workspaceId: workspaceId,
        id: roleId,
      },
    });
    if (!roleExists) throw new NotFoundException();
    if (workspaceMembership.roleId == roleId) throw new ConflictException();

    return this.prisma.workspaceMembers.update({
      where: {
        id: workspaceMembership.id,
      },
      data: {
        roleId: workspaceMembership.roleId,
      },
    });
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

  async getInvite(inviteId: string) {
    return this.prisma.workspaceInvites.findUnique({
      where: {
        id: inviteId,
      },
    });
  }

  async inviteMember(workspaceId: string, email: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException();
    if (workspace.type == 'PERSONAL') throw new ForbiddenException();

    const inviteAlreadyExists = await this.prisma.workspaceInvites.findFirst({
      where: {
        workspaceId: workspaceId,
        email: email,
      },
    });
    if (inviteAlreadyExists)
      throw new ConflictException('USER_ALREADY_INVITED');

    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      const userInvite = await this.prisma.workspaceInvites.create({
        data: {
          email: email,
          workspaceId: workspaceId,
        },
      });
      if (!userInvite) throw new InternalServerErrorException();

      /**
       * @todo send an email to invite user
       */
      return userInvite;
    } else {
      const isUserAlreadyInWorkspace = await this.prisma.workspace.findFirst({
        where: {
          AND: [
            { id: workspaceId },
            {
              OR: [
                {
                  owner: {
                    email: email,
                  },
                },
                {
                  WorkspaceMembers: {
                    some: {
                      user: {
                        email: email,
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      });

      if (isUserAlreadyInWorkspace) throw new ConflictException();

      const userInvite = await this.prisma.workspaceInvites.create({
        data: {
          email: email,
          workspaceId: workspaceId,
        },
      });
      if (!userInvite) throw new InternalServerErrorException();

      /**
       * @todo send an email notification ?
       */
      return userInvite;
    }
  }

  async deleteInvite(inviteId) {
    const invite = await this.prisma.workspaceInvites.findUnique({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException('INVITE_NOT_FOUND');

    return this.prisma.workspaceInvites.delete({
      where: {
        id: inviteId,
      },
    });
  }
}
