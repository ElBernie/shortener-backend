import { Injectable } from '@nestjs/common';
import { InfluxClientService } from '@sunbzh/nest-influx';
import { PrismaService } from 'src/Prisma/prisma.service';
import { QueryApi } from '@influxdata/influxdb-client';

interface GetWorkspaceStatsOptions {
  includes?: {
    visits: boolean;
  };
}

@Injectable()
export default class WorkspacesStatsService {
  private influxQuery: QueryApi;
  constructor(
    private prisma: PrismaService,
    private influx: InfluxClientService,
  ) {
    this.influxQuery = this.influx.getQueryApi('sunbzh');
  }

  async getWorkspaceStats(
    workspaceId: string,
    options: GetWorkspaceStatsOptions,
  ) {
    let visits: number;
    if (options.includes.visits) {
      visits = await this.getWorkspacesVisits(workspaceId);
    }

    return { visits };
  }

  async getWorkspacesVisits(workspaceId: string): Promise<number> {
    const query = `
    from(bucket: "links")
        |> range(start: 1, stop: ${Date.now()})
        |> filter(fn: (r) => r["_measurement"] == "linkHit")
        |> filter(fn: (r) => r["workspaceId"] == "${workspaceId}")
        |> pivot(columnKey: ["_field"], rowKey:[ "_time"], valueColumn: "_value")
        |> group()
        |> set(key: "count", value:"0")
        |> count(column: "count")
    `;

    for await (const { values, tableMeta } of this.influxQuery.iterateRows(
      query,
    )) {
      const o = tableMeta.toObject(values);
      return o.count;
    }
  }
}
