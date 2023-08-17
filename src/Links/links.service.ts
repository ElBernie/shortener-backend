import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { JwtPayload } from 'src/Auth/JWT.strategy';
import * as nanoid from 'nanoid';

@Injectable()
export default class LinksService {
  constructor(private prismaService: PrismaService) {}

  async getLinkByAlias(alias: string) {
    const link = await this.prismaService.links.findUnique({
      where: {
        alias: alias,
      },
      include: {
        URL: true,
      },
    });
    if (!link) throw new NotFoundException();

    return link;
  }

  createUrl({
    linkData,
    user,
  }: {
    linkData: LinkCreationDTO;
    user: JwtPayload;
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
      include: {
        URL: true,
      },
    });
  }

  async updateUrl({
    alias,
    user,
    newAlias,
    url,
  }: {
    alias: string;
    user: JwtPayload;
    newAlias?: string;
    url?: string;
  }) {
    if (!user.userId) throw new UnauthorizedException();

    const currentUrl = await this.prismaService.links.findUnique({
      where: { alias: alias },
    });
    if (!currentUrl) throw new NotFoundException();
    if (currentUrl.userId != user.userId || currentUrl.userId == null)
      throw new UnauthorizedException();

    if (newAlias) {
      const isNewAliasAlreadyTaken = await this.prismaService.links.findUnique({
        where: { alias: newAlias },
      });
      if (isNewAliasAlreadyTaken) throw new ConflictException();
    }

    const URLData = url ? new URL(url) : null;
    return this.prismaService.links.update({
      where: {
        alias: alias,
      },
      data: {
        ...(newAlias && { alias: newAlias }),
        ...(URLData && {
          URL: {
            connectOrCreate: {
              where: {
                url: url,
              },
              create: {
                url: url,
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

  async deleteUrl({ alias, user }: { alias: string; user: JwtPayload }) {
    const { userId } = user;
    if (!userId) throw new UnauthorizedException();

    const link = await this.prismaService.links.findUnique({
      where: { alias: alias },
    });
    if (!link) throw new NotFoundException();
    if (link.userId != userId || link.userId == null)
      throw new UnauthorizedException();

    return this.prismaService.links.delete({
      where: {
        id: link.id,
      },
    });
  }
}
