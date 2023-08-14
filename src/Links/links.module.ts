import { Module } from '@nestjs/common';
import LinksController from './link.controller';
import LinksService from './links.service';

@Module({
  controllers: [LinksController],
  providers: [LinksService],
})
export default class LinksModule {}
