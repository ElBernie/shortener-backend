import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { JwtPayload } from 'src/Auth/JWT.strategy';

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

  createUrl({
    linkData,
    user,
  }: {
    linkData: LinkCreationDTO;
    user: JwtPayload;
  }) {
    const URLData = new URL(linkData.url);
    return this.prismaService.links.create({
      data: {
        alias: 'monalias2',
        ...(user.userId && {
          user: {
            connect: {
              id: user.userId,
            },
          },
        }),
        URL: {
          connectOrCreate: {
            where: {
              url: linkData.url,
            },
            create: {
              url: linkData.url,
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
