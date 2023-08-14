import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDTO } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class AuthService {
  constructor(private prismaService: PrismaService) {}
  register(userData: RegisterDTO) {
    return this.prismaService.user.create({
      data: {
        email: userData.email,
        password: bcrypt.hashSync(userData.password, 10),
      },
    });
  }
}
