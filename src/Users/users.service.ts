import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from 'src/Workspaces/services/workspaces.service';

interface GetUserOptions {
  remove?: Array<keyof Omit<User, 'id' | 'password'>>;
}
@Injectable()
export default class UsersService {
  constructor(
    private prismaService: PrismaService,
    private workspacesService: WorkspacesService,
  ) {}

  async getUser(userId: string, options?: GetUserOptions) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException();
    if (options) options.remove.forEach((key) => delete user[key]);
    delete user.password;

    return user;
  }

  deleteUser = async (userId: string, forceWorkspacesDeletion?: boolean) => {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        OwnedWorkspaces: true,
      },
    });
    if (!user) throw new NotFoundException();
    if (user.OwnedWorkspaces.length > 1 && !forceWorkspacesDeletion)
      throw new ConflictException('USER_OWNS_WORKSPACES');

    return this.prismaService.user.delete({ where: { id: userId } });
  };

  async getUserWorkspaces(userId: string) {
    const ownedWorkspaces = await this.prismaService.workspace.findMany({
      where: {
        ownerId: userId,
      },
    });

    const workspacesMembership = await this.prismaService.workspace.findMany({
      where: {
        NOT: [
          {
            ownerId: userId,
          },
        ],
        WorkspaceMembers: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        WorkspaceMembers: {
          include: {
            role: true,
          },
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

  async acceptInvite({
    inviteId,
    userId,
  }: {
    inviteId: string;
    userId: string;
  }) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    const invite = await this.prismaService.workspaceInvites.findUnique({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException();

    if (invite.email != user.email) throw new ForbiddenException();

    const defaultRole = await this.prismaService.workspaceRoles.findFirst({
      where: {
        workspaceId: invite.workspaceId,
        default: true,
      },
    });
    /** @todo better error ? */
    if (!defaultRole) throw new ConflictException('NO_DEFAULT_ROLE');

    await this.prismaService.workspaceMembers.create({
      data: {
        roleId: defaultRole.id,
        userId: userId,
        workspaceId: invite.workspaceId,
      },
    });

    return this.prismaService.workspaceInvites.delete({
      where: { id: inviteId },
    });
  }

  async rejectInvite({
    inviteId,
    userId,
  }: {
    inviteId: string;
    userId: string;
  }) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    const invite = await this.prismaService.workspaceInvites.findUnique({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException();

    if (invite.email != user.email) throw new ForbiddenException();

    return this.prismaService.workspaceInvites.delete({
      where: { id: inviteId },
    });
  }
}
