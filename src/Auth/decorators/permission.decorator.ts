import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { WORKSPACE_PERMISSIONS } from 'src/Workspaces/types';
import PermissionGuard from '../guards/permission.guard';
import JwtAuthGuard from '../guards/JWT.guard';

const Permission = (permission: keyof typeof WORKSPACE_PERMISSIONS) => {
  return applyDecorators(
    SetMetadata('permission', permission),
    UseGuards(JwtAuthGuard),
    UseGuards(PermissionGuard),
  );
};

export default Permission;
