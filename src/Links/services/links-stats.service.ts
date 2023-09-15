import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluxClientService } from '@sunbzh/nest-influx';
import { Point, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import LinksService from './links.service';
import RegisterHitDTO from '../DTO/stats-register-hit.dto';
import { PrismaService } from 'src/Prisma/prisma.service';

interface GetLinkStatsOptions {
  includes?: {
    visits: boolean;
    langs: boolean;
  };
}

@Injectable()
export default class LinksStatsService {
  private influxQuery: QueryApi;
  private influxWrite: WriteApi;

  constructor(
    private prisma: PrismaService,
    private influx: InfluxClientService,
    private linksService: LinksService,
  ) {
    this.influxQuery = this.influx.getQueryApi('sunbzh');
    this.influxWrite = this.influx.getWriteApi('sunbzh', 'links');
  }

  async registerHit(linkId: string, hitData: RegisterHitDTO) {
    const link = await this.linksService.getLinkById(linkId);
    if (!link) throw new NotFoundException();

    const hitPoint = new Point('linkHit')
      .tag('linkId', linkId)
      .tag('workspaceId', link.workspaceId)
      .tag('URLId', link.URLId)
      .tag('host', link.host);

    Object.entries(hitData).forEach((data) => {
      if (data[0] == 'lat' || data[0] == 'lon')
        hitPoint.floatField(data[0], data[1]);
      hitPoint.stringField(data[0], data[1]);
    });
    this.influxWrite.writePoint(hitPoint);

    return this.prisma.links.update({
      where: { id: link.id },
      data: {
        hits: {
          increment: 1,
        },
        URL: {
          update: {
            hits: {
              increment: 1,
            },
          },
        },
        Domain: {
          update: {
            hits: {
              increment: 1,
            },
          },
        },
      },
    });
  }
  async getLinkStats(linkId: string, options: GetLinkStatsOptions) {
    let visits: number;
    if (options.includes.visits) {
      visits = await this.getLinkVisits(linkId);
    }

    let langs: Array<{ lang: string; count: number }>;
    if (options.includes.langs) {
      langs = await this.getLangs(linkId);
    }

    return { visits, langs };
  }

  async getLinkVisits(linkId: string): Promise<number> {
    const query = `
    from(bucket: "links")
        |> range(start: 1, stop: ${Date.now()})
        |> filter(fn: (r) => r["_measurement"] == "linkHit")
        |> filter(fn: (r) => r["linkId"] == "${linkId}")
        |> pivot(columnKey: ["_field"], rowKey:[ "_time"], valueColumn: "_value")
        |> group()
        |> set(key: "count", value:"0")
        |> count(column: "count")
        |> yield(name:"count")
    `;

    for await (const { values, tableMeta } of this.influxQuery.iterateRows(
      query,
    )) {
      const o = tableMeta.toObject(values);
      return o.count;
    }
  }

  async getLangs(linkId: string): Promise<any> {
    const query = `
        from(bucket: "links")
        |> range(start:1, stop: ${Date.now()})
        |> filter(fn: (r) => r["_measurement"] == "linkHit")
        |> filter(fn:(r) => r["linkId"] == "${linkId}")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> group(columns: ["lang"])
        |> filter(fn:(r) => r["lang"] != "")
        |> set(key: "count", value:"0")
        |> count(column:"count")
        |> group()
        |> sort(columns: ["count"], desc:true)
    `;

    const langs = [];
    for await (const { values, tableMeta } of this.influxQuery.iterateRows(
      query,
    )) {
      const data = tableMeta.toObject(values);
      langs.push({ lang: data.lang, count: data.count });
    }

    return langs;
  }
}
