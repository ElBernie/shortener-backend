import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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

    const { email, password, ...userData } = user;
    return userData;
  }
}
