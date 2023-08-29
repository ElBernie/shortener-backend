import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import WorkspacesService from 'src/Workspaces/services/workspaces.service';
import { Request, WORKSPACE_PERMISSIONS } from 'src/types';

@Injectable()
export default class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspacesService: WorkspacesService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredPermission = this.reflector.getAllAndOverride<
      keyof typeof WORKSPACE_PERMISSIONS
    >('permission', [context.getHandler(), context.getClass()]);

    const request: Request = context.switchToHttp().getRequest<Request>();
    console.log(request.params.workspaceId);
    if (!(request.body.workspaceId || request.params.workspaceId))
      throw new BadRequestException('MISSING_WORKSPACE_ID');

    console.log(request.user);
    if (!request.user?.userId)
      throw new UnauthorizedException('MISSING_USER_ID');

    const userHasPermission = await this.workspacesService.userHasPermission(
      request.user.userId,
      request.body.workspaceId || request.params.workspaceId,
      requiredPermission,
    );

    if (!userHasPermission) throw new UnauthorizedException();
    return true;
  }
}
