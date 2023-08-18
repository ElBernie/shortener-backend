import { Module } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import LinksController from './link.controller';
import LinksService from './links.service';

@Module({
  controllers: [LinksController],
  providers: [PrismaService, LinksService],
})
export default class LinksModule {}
