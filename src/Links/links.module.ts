import { Module } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import LinksController from './link.controller';
import LinksService from './services/links.service';
import WorkspacesService from 'src/Workspaces/services/workspaces.service';
import LinksStatsService from './services/links-stats.service';

@Module({
  controllers: [LinksController],
  providers: [
    PrismaService,
    LinksService,
    WorkspacesService,
    LinksStatsService,
  ],
  exports: [LinksService],
})
export default class LinksModule {}
