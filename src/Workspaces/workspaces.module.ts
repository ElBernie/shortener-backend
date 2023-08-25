import { Module } from '@nestjs/common';
import WorkspacesController from './workspaces.controller';
import { PrismaService } from 'src/Prisma/prisma.service';
import WorkspacesService from './workspaces.service';

@Module({
  controllers: [WorkspacesController],
  providers: [PrismaService, WorkspacesService],
})
export default class WorkspacesModule {}
