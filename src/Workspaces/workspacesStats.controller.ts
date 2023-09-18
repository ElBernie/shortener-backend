import { Controller, Get, Param, Query } from '@nestjs/common';
import WorkspacesStatsService from './services/workspaces-stats.service';
import WorkspaceStatsGetVisitsDTO from './DTO/stats/get-visits.dto';

@Controller('/workspaces/:workspaceId/stats')
export default class WorkspacesStatsController {
  constructor(private workspacesStatsService: WorkspacesStatsService) {}

  @Get()
  async getWorkspaceStats(@Param('workspaceId') workspaceId: string) {
    return this.workspacesStatsService.getWorkspaceStats(workspaceId, {
      includes: { visits: true },
    });
  }

  @Get('/visits')
  async getWorkspaceLinksVisits(
    @Param('workspaceId') workspaceId: string,
    @Query()
    query: WorkspaceStatsGetVisitsDTO,
  ) {
    return this.workspacesStatsService.getWorkspaceVisits(workspaceId, query);
  }

  @Get('/langs')
  async getWorkspaceLinksVisitsLangs(
    @Param('workspaceId') workspaceId: string,
    @Query() query: WorkspaceStatsGetVisitsDTO,
  ) {
    return this.workspacesStatsService.getWorkspaceLangs(workspaceId, query);
  }
}
