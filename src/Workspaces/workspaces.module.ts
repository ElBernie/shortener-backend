import { Module, forwardRef } from '@nestjs/common';
import LinksModule from 'src/Links/links.module';
import UsersModule from 'src/Users/users.module';

import WorkspacesController from './workspaces.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from './services/workspaces.service';
import WorkspacesMembersController from './workspacesMembers.controller';
import WorkspacesRolesService from './services/workspacesRoles.service';
import WorkspacesMembersService from './services/workspacesMembers.service';
import WorkspacesRolesController from './workspacesRoles.controller';

import WorkspacesStatsModule from 'src/WorkspacesStats/workspacesStats.module';

@Module({
  imports: [LinksModule, forwardRef(() => UsersModule), WorkspacesStatsModule],
  controllers: [
    WorkspacesController,
    WorkspacesRolesController,
    WorkspacesMembersController,
  ],
  providers: [
    PrismaService,
    WorkspacesService,
    WorkspacesRolesService,
    WorkspacesMembersService,
  ],
  exports: [WorkspacesService],
})
export default class WorkspacesModule {}
