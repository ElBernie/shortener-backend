import { Module } from '@nestjs/common';
import WorkspacesController from './workspaces.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersController from './workspacesMembers.controller';
import WorkspacesRolesService from './services/workspacesRoles.service';
import WorkspacesMembersServices from './services/workspacesMembers.service';
import LinksModule from 'src/Links/links.module';
import LinksService from 'src/Links/links.service';
import WorkspacesRolesController from './workspacesRoles.controller';

@Module({
  imports: [LinksModule],
  controllers: [
    WorkspacesController,
    WorkspacesRolesController,
    WorkspacesMembersController,
  ],
  providers: [
    PrismaService,
    WorkspacesService,
    WorkspacesRolesService,
    WorkspacesMembersServices,
    LinksService,
  ],
  exports: [WorkspacesService],
})
export default class WorkspacesModule {}
