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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export default class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailService: MailerService,
  ) {}

  async register(userData: RegisterDTO) {
    try {
      const createUser = await this.prismaService.user.create({
        data: {
          email: userData.email,
          password: bcrypt.hashSync(userData.password, 10),
          OwnedWorkspaces: {
            create: {
              name: `Personal Workspace`,
              deletable: false,
            },
          },
        },
        include: {
          OwnedWorkspaces: true,
        },
      });

      delete createUser.email;
      delete createUser.password;

      this.emailService.sendMail({
        from: process.env.DEFAULT_FROM_EMAIL,
        to: userData.email,
        template: 'emailValidation',
        subject: 'Confirmez votre compte Sun.bzh',

        context: {
          validationLink: `${process.env.WEBSITE_URL}/auth/validate/${createUser.validationToken}`,
        },
      });

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
      include: {
        OwnedWorkspaces: true,
      },
    });

    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (!bcrypt.compareSync(userLoginData.password, user.password))
      throw new UnauthorizedException();

    const defaultWorkspace = user.OwnedWorkspaces.filter(
      (workspace) => workspace.type == 'PERSONAL',
    );

    const payload = {};
    const token = this.jwtService.sign(payload, { subject: user.id });
    return { access_token: token, defaultWorkspace: defaultWorkspace[0] };
  }

  async validate(validationToken: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        validationToken: validationToken,
      },
    });

    if (!user) throw new NotFoundException();

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        validated: true,
        validationToken: null,
      },
    });

    return { email: user.email };
  }
}
