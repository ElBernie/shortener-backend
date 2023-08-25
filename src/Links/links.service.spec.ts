import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import LinksService from './links.service';
import { PrismaService } from '../Prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

const user = { userId: uuid() };
const linksArray = [
  {
    id: uuid(),
    alias: 'firstLink',
    createdAt: '2023-08-16T08:36:20.233Z',
    updatedAt: '2023-08-16T08:36:20.233Z',
    userId: user.userId,
    URLId: uuid(),
    host: 'www.google.com',
  },
  {
    id: uuid(),
    alias: 'secondLink',
    createdAt: '2023-08-16T10:36:20.233Z',
    updatedAt: '2023-08-16T10:36:20.233Z',
    userId: user.userId,
    URLId: uuid(),
    host: 'www.bing.com',
  },
  {
    id: uuid(),
    alias: 'thirdLink',
    createdAt: '2023-08-16T12:36:20.233Z',
    updatedAt: '2023-08-16T12:36:20.233Z',
    userId: user.userId,
    URLId: uuid(),
    host: 'www.yahoo.com',
  },
];

const db = {
  links: {
    findMany: jest.fn().mockResolvedValue(linksArray),
    findUnique: jest.fn().mockResolvedValue(linksArray[0]),
    findFirst: jest.fn().mockResolvedValue(linksArray[0]),
    create: jest.fn().mockReturnValue(linksArray[0]),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(linksArray[0]),
    delete: jest.fn().mockResolvedValue(linksArray[0]),
  },
};

describe('LinksService', () => {
  let service: LinksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get(LinksService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLinkByAlias', () => {
    it('should return a link', async () => {
      expect(service.getLinkByAlias('firstLink')).resolves.toEqual(
        linksArray[0],
      );
    });
  });

  describe('createUrl', () => {
    it('should create a link', () => {
      expect(
        service.createUrl({
          linkData: {
            url: 'https://www.google.com',
            alias: 'firstLink',
          },
          user: user,
        }),
      ).toEqual(linksArray[0]);
    });
  });

  describe('updateUrl', () => {
    it('should update a link', async () => {
      const link = await service.updateUrl({
        alias: 'firstLink',
        user: user,
        url: 'https://www.yahoo.com',
      });
      expect(link).toEqual(linksArray[0]);
    });
  });

  describe('deleteUrl', () => {
    it('should delete a link', () => {
      expect(
        service.deleteUrl({
          alias: 'firstLink',
          user: user,
        }),
      ).resolves.toEqual(linksArray[0]);
    });

    it('should throw an UnauthorizedException if userId is not valid', () => {
      expect(
        service.deleteUrl({
          alias: 'firstLink',
          user: { userId: 'bad id' },
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
