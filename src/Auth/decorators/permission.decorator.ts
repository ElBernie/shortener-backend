import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import PermissionGuard from '../guards/permission.guard';
import JwtAuthGuard from '../guards/JWT.guard';
import { WORKSPACE_PERMISSIONS } from 'src/types';

const Permission = (permission: keyof typeof WORKSPACE_PERMISSIONS) => {
  return applyDecorators(
    SetMetadata('permission', permission),
    UseGuards(JwtAuthGuard),
    UseGuards(PermissionGuard),
  );
};

export default Permission;
