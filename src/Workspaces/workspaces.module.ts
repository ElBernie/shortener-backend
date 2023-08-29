import { Module } from '@nestjs/common';
import WorkspacesController from './workspaces.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersController from './workspacesMembers.controller';
import WorkspacesRolesService from './services/workspacesRoles.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';

@Module({
  controllers: [WorkspacesController, WorkspacesMembersController],
  providers: [
    PrismaService,
    WorkspacesService,
    WorkspacesRolesService,
    WorkspacesMembersServices,
  ],
  exports: [WorkspacesService],
})
export default class WorkspacesModule {}
