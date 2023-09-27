import { Module } from '@nestjs/common';
import WorkspacesStatsService from './workspacesStats.service';
import WorkspacesStatsController from './workspacesStats.controller';

@Module({
  providers: [WorkspacesStatsService],
  controllers: [WorkspacesStatsController],
  exports: [WorkspacesStatsService],
})
export default class WorkspacesStatsModule {}
