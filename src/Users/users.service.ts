import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
