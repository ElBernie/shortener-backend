import { Test, TestingModule } from '@nestjs/testing';
import LinksController from './link.controller';
import LinksService from './services/links.service';
import { PrismaService } from '../Prisma/prisma.service';
import LinkCreationDTO from './DTO/link-creation.dto';
import { Request } from 'src/types';
import LinkUpdateDTO from './DTO/link-update.dto';

const requestMock = {} as unknown as Request;
const linkMock = {
  id: 'uuid',
  alias: 'firstLink',
  createdAt: '2023-08-16T08:36:20.233Z',
  updatedAt: '2023-08-16T08:36:20.233Z',
  userId: 'user-uuid',
  URLId: 'url-uuid',
  host: 'www.google.com',
};

describe('LinksController', () => {
  let linksController: LinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        PrismaService,
        {
          provide: LinksService,
          useValue: {
            getLinkByAlias: jest
              .fn()
              .mockImplementation((alias: string) =>
                Promise.resolve({ alias: alias, ...linkMock }),
              ),
            createUrl: jest
              .fn()
              .mockImplementation((linkData: LinkCreationDTO) =>
                Promise.resolve({
                  alias: linkData.alias,
                  url: linkData.url,
                  ...linkMock,
                }),
              ),
            updateUrl: jest.fn().mockImplementation((linkData: LinkUpdateDTO) =>
              Promise.resolve({
                alias: linkData.newAlias,
                URLId: 'new-urlid',
                ...linkMock,
              }),
            ),
            deleteUrl: jest
              .fn()
              .mockImplementation((alias: string) => Promise.resolve(linkMock)),
          },
        },
      ],
    }).compile();

    linksController = module.get(LinksController);
  });

  it('should be defined', () => {
    expect(linksController).toBeDefined();
  });

  describe('getLink', () => {
    it('should find a link by alias', async () => {
      expect(linksController.getLink('alias')).resolves.toEqual(linkMock);
    });
  });

  describe('createLink', () => {
    it('should create a new link', () => {
      expect(
        linksController.createLink(requestMock, {
          url: 'https://www.google.com',
          alias: 'alias',
        }),
      ).resolves.toEqual(linkMock);
    });
  });

  describe('updateLink', () => {
    it('should update a link', () => {
      expect(
        linksController.updateLink(requestMock, 'current-alias', {
          newAlias: 'new-alias',
          url: 'https://www.google.com',
        }),
      ).resolves.toEqual(linkMock);
    });
  });

  describe('deleteLink', () => {
    it('should delete a link', () => {
      expect(linksController.deleteLink(requestMock, 'alias')).resolves.toEqual(
        linkMock,
      );
    });
  });
});
