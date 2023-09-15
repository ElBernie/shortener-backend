import { Controller, Get, Param } from '@nestjs/common';
import WorkspacesStatsService from './services/workspaces-stats.service';

@Controller('/workspaces/:workspaceId/stats')
export default class WorkspacesStatsController {
  constructor(private workspacesStatsService: WorkspacesStatsService) {}

  @Get()
  async getLinkStats(@Param('workspaceId') workspaceId: string) {
    return this.workspacesStatsService.getWorkspaceStats(workspaceId, {
      includes: { visits: true },
    });
  }
}
