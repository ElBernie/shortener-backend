import { Module } from '@nestjs/common';
import WorkspacesController from './workspaces.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from './workspaces.service';
import WorkspacesRolesService from './workspacesRoles.service';

@Module({
  controllers: [WorkspacesController],
  providers: [PrismaService, WorkspacesService, WorkspacesRolesService],
  exports: [WorkspacesService],
})
export default class WorkspacesModule {}
