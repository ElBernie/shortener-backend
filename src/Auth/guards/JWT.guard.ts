import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ALLOW_ANONYMOUS } from '../decorators/allowanonymous.decorator';

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANONYMOUS,
      [context.getHandler(), context.getClass()],
    );
    const requestHeaders = super.getRequest(context).headers;

    if (allowAnonymous) {
      //If we detect an authorization header, while the route allows anonymous user, we check if it's valid
      if (requestHeaders.authorization) {
        return super.canActivate(context);
      }
      return true;
    }

    return super.canActivate(context);
  }
}
