import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AuthModule from './Auth/auth.module';
import UsersModule from './Users/users.module';
import LinksModule from './Links/links.module';
import PrismaModule from './Prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    LinksModule,
  ],
})
export class AppModule {}
