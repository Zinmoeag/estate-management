import passport from 'passport';
// @ts-ignore
import { Strategy as JwtCookieComboStrategy } from 'passport-jwt-cookiecombo';

import { ACCESS_TOKEN_PUBLIC_KEY } from '@/utils/auth/jwt';

passport.use(
  'access-jwt-cookie',
  new JwtCookieComboStrategy(
    {
      jwtVerifyOptions: {
        algorithms: ['RS256'], // Match your JWT signing algorithm
      },
      passReqToCallback: false,
      secretOrPublicKey: ACCESS_TOKEN_PUBLIC_KEY, // Or your JWT secret
    },
    async (jwt_payload: any, done: any) => {
      try {
        console.log(jwt_payload, 'jwt_payload ==>');
        //   const user = await authRepository.findById(jwt_payload.id);
        done(null, jwt_payload);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
