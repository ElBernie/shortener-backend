import { Module, forwardRef } from '@nestjs/common';
import UsersController from './users.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import UsersService from './users.service';
import WorkspacesModule from 'src/Workspaces/workspaces.module';

@Module({
  imports: [forwardRef(() => WorkspacesModule)],
  controllers: [UsersController],
  providers: [PrismaService, UsersService],
  exports: [UsersService],
})
export default class UsersModule {}
