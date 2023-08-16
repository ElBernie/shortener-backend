import { Request as ExpressRequest } from 'express';
import { JwtPayload } from './Auth/JWT.strategy';

export type Request = ExpressRequest & {
  user?: JwtPayload;
};
