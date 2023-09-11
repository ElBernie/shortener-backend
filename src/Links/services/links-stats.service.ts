import { QueryApi } from '@influxdata/influxdb-client';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InfluxClientService } from '@sunbzh/nest-influx';

interface GetLinkStatsOptions {
  includes?: {
    [key: string]: boolean;
  };
}

@Injectable()
export default class LinksStatsService {
  private influxQuery: QueryApi;
  constructor(private influx: InfluxClientService) {
    this.influxQuery = this.influx.getQueryApi('sunbzh');
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
      // lang, count
      const data = tableMeta.toObject(values);
      langs.push({ lang: data.lang, count: data.count });
    }

    return langs;
  }
}
