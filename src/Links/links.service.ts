import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import LinkCreationDTO from './DTO/link-creation.dto';

@Injectable()
export default class LinksService {
  constructor(private prismaService: PrismaService) {}

  getLinkByAlias(alias: string) {
    return this.prismaService.links.findUnique({
      where: {
        alias: alias,
      },
      include: {
        URL: true,
      },
    });
  }

  createUrl(creationData: LinkCreationDTO) {
    const URLData = new URL(creationData.url);
    return this.prismaService.links.create({
      data: {
        alias: 'monalias',
        URL: {
          connectOrCreate: {
            where: {
              url: creationData.url,
            },
            create: {
              url: creationData.url,
              protocol: URLData.protocol,
              pathname: URLData.pathname,
              search: URLData.search,
              hash: URLData.hash,
              Domain: {
                connectOrCreate: {
                  where: {
                    host: URLData.host,
                  },
                  create: {
                    host: URLData.host,
                  },
                },
              },
            },
          },
        },
        Domain: {
          connectOrCreate: {
            where: {
              host: URLData.host,
            },
            create: {
              host: URLData.host,
            },
          },
        },
      },
    });
  }
}
