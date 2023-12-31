import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export type JwtPayload = {
  userId: string;
};
@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SIGN_KEY,
    });
  }

  // If the JWT is legit, Passport use validate() to extract and returns data contained in the JWT.
  validate(jwtPayload: any): JwtPayload {
    return { userId: jwtPayload.sub };
  }
}
