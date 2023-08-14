import { Module } from '@nestjs/common';
import UsersModule from './Users/users.module';
import LinksModule from './Links/links.module';

@Module({
  imports: [UsersModule, LinksModule],
})
export class AppModule {}
