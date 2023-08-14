import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AuthModule from './Auth/auth.module';
import UsersModule from './Users/users.module';
import LinksModule from './Links/links.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UsersModule, LinksModule],
})
export class AppModule {}
