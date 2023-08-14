import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import UsersModule from './Users/users.module';
import LinksModule from './Links/links.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, LinksModule],
})
export class AppModule {}
