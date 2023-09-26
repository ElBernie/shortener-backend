import { Injectable } from '@nestjs/common';
import { InfluxClientService } from '@sunbzh/nest-influx';
import { PrismaService } from 'src/Prisma/prisma.service';
import { QueryApi, flux, fluxDuration } from '@influxdata/influxdb-client';
import { DeleteAPI } from '@influxdata/influxdb-client-apis';

interface GetWorkspaceStatsOptions {
  includes?: {
    visits: boolean;
  };
}

@Injectable()
export default class WorkspacesStatsService {
  private influxQuery: QueryApi;
  private influxDeleteAPI: DeleteAPI;
  constructor(
    private prisma: PrismaService,
    private influx: InfluxClientService,
  ) {
    this.influxQuery = this.influx.getQueryApi('sunbzh');
    this.influxDeleteAPI = new DeleteAPI(this.influx.influxDB);
  }

  async getWorkspaceStats(
    workspaceId: string,
    options: GetWorkspaceStatsOptions,
  ) {
    let visits: number;
    if (options.includes.visits) {
      visits = await this.getWorkspacesTotalVisits(workspaceId);
    }

    return { visits };
  }

  async getWorkspacesTotalVisits(workspaceId: string): Promise<number> {
    const query = flux`from(bucket: "links")
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

  async deleteWorkspaceStats(
    workspaceId: string,
    params?: { start?: Date; end?: Date },
  ) {
    const start = params.start ? new Date(params.start) : new Date(1970, 1, 1);
    const end = params.end ? new Date(params.end) : new Date(Date.now());
    await this.influxDeleteAPI.postDelete({
      bucket: 'links',
      org: 'sunbzh',
      body: {
        start: start.toISOString(),
        stop: end.toISOString(),
        predicate: `workspaceId="${workspaceId}"`,
      },
    });
  }

  async getWorkspaceVisits(
    workspaceId: string,
    params: { start?: string; end?: string; interval?: string },
  ) {
    const query = flux`
      from(bucket: "links")
        |> range(start:${fluxDuration(params.start) ?? '-7d'}, stop:${
      fluxDuration(params.end) ?? 'now()'
    })
        |> filter(fn: (r) => r["_measurement"] == "linkHit")
        |> filter(fn: (r) => r["workspaceId"] == "${workspaceId}")
        |> pivot(columnKey: ["_field"], rowKey: ["_time"], valueColumn: "_value")
        |> set(key: "_value", value:"0")
        |> group()
        |> aggregateWindow(every: ${
          fluxDuration(params.interval) ?? '1d'
        }, fn:count, createEmpty: true)
    `;

    const data = [];
    for await (const { values, tableMeta } of this.influxQuery.iterateRows(
      query,
    )) {
      const o = tableMeta.toObject(values);
      data.push({ time: o._time, value: o._value });
    }
    return data;
  }

  async getWorkspaceLangs(
    workspaceId: string,
    params: { start?: string; end?: string; interval?: string },
  ) {
    const query = flux`
        from(bucket: "links")
          |> range(start:${fluxDuration(params.start) ?? '-7d'}, stop: ${
      fluxDuration(params.end) ?? 'now()'
    })
          |> filter(fn: (r) => r["_measurement"] == "linkHit" and r["workspaceId"] == "${workspaceId}")
          |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> group(columns: ["lang"])
          |> set(key: "count", value:"0")
          |> count(column:"count")
          |>group()
          |> sort(columns: ["count"], desc:true)
    `;

    const data = [];
    for await (const { values, tableMeta } of this.influxQuery.iterateRows(
      query,
    )) {
      const o = tableMeta.toObject(values);
      data.push({ lang: o.lang ?? 'Unknown', value: o.count });
    }
    return data;
  }
}
