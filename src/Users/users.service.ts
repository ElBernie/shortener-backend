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
}
