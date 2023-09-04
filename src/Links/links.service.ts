import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import * as nanoid from 'nanoid';
import { RequireAtLeastOne } from 'src/types';
import { Prisma } from '@prisma/client';

@Injectable()
export default class LinksService {
  constructor(private prismaService: PrismaService) {}

  async getLinks(params: {
    where: RequireAtLeastOne<{
      workspaceId: string;
      userId: string;
    }>;
    include?: Prisma.LinksInclude;
  }) {
    return this.prismaService.links.findMany({
      where: params.where,
      include: params.include,
    });
  }

  async getLinkById(id: string, options?: { include?: { url?: boolean } }) {
    const link = await this.prismaService.links.findUnique({
      where: {
        id: id,
      },
      include: {
        ...(options.include.url && { URL: true }),
      },
    });
    if (!link) throw new NotFoundException();
    return link;
  }

  async getLinkByAlias(
    alias: string,
    options?: { include?: { url?: boolean } },
  ) {
    const link = await this.prismaService.links.findUnique({
      where: {
        alias: alias,
      },
      include: {
        ...(options.include.url && { URL: true }),
      },
    });
    if (!link) throw new NotFoundException();

    return link;
  }

  async getLinkByUrl(url: string) {
    return this.prismaService.links.findFirst({
      where: {
        URL: {
          url: url,
        },
      },
    });
  }

  createUrl({
    linkData,
    userId,
    workspaceId,
  }: {
    linkData: LinkCreationDTO;
    userId?: string;
    workspaceId?: string;
  }) {
    const URLData = new URL(linkData.url);

    const alias =
      linkData.alias ||
      nanoid.customAlphabet(
        process.env.URL_ALIAS_ALPHABET ||
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      )(Number(process.env.URL_ALIAS_LENGTH) || 7);

    return this.prismaService.links.create({
      data: {
        alias: alias,
        ...(userId && {
          user: {
            connect: {
              id: userId,
            },
          },
        }),
        ...(workspaceId && {
          workspace: {
            connect: {
              id: workspaceId,
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
      include: {
        URL: true,
      },
    });
  }

  async updateUrl(
    linkId: string,
    data: RequireAtLeastOne<{
      alias?: string;
      url?: string;
    }>,
  ) {
    const currentUrl = await this.prismaService.links.findUnique({
      where: { id: linkId },
    });
    if (!currentUrl) throw new NotFoundException();

    if (data.alias) {
      const isNewAliasAlreadyTaken = await this.prismaService.links.findUnique({
        where: { alias: data.alias },
      });
      if (isNewAliasAlreadyTaken) throw new ConflictException();
    }

    const URLData = data.url ? new URL(data.url) : null;
    return this.prismaService.links.update({
      where: {
        id: linkId,
      },
      data: {
        ...(data.alias && { alias: data.alias }),
        ...(URLData && {
          URL: {
            connectOrCreate: {
              where: {
                url: data.url,
              },
              create: {
                url: data.url,
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
        }),
      },
    });
  }

  async deleteUrl(linkId: string) {
    const link = await this.prismaService.links.findUnique({
      where: { id: linkId },
    });
    if (!link) throw new NotFoundException();

    return this.prismaService.links.delete({
      where: {
        id: link.id,
      },
    });
  }
}
