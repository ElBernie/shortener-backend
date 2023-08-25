import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

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
}
