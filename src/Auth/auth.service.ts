import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';
import { RegisterDTO } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
import LoginDTO from './DTO/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(userData: RegisterDTO) {
    try {
      const createUser = await this.prismaService.user.create({
        data: {
          email: userData.email,
          password: bcrypt.hashSync(userData.password, 10),
        },
      });

      delete createUser.email;
      delete createUser.password;
      return createUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException();
        throw new Error(error.message);
      }
      throw new Error(error);
    }
  }

  async login(userLoginData: LoginDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userLoginData.email,
      },
    });

    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (!bcrypt.compareSync(userLoginData.password, user.password))
      throw new UnauthorizedException();

    const payload = {};
    const token = this.jwtService.sign(payload, { subject: user.id });
    return { access_token: token };
  }
}
