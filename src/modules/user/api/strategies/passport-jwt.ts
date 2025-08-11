import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';

import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';
import { ACCESS_TOKEN_PUBLIC_KEY } from '@/utils/auth/jwt';

import { AuthUserDTO } from '../dtos/AuthUserDTO';

const authRepository = new AuthRepository();

const cookieExtractor = (req: any): null | string => {
  let token: null | string = null;
  if (req?.cookies) {
    token = req.cookies['__Secure-accessToken'];
  }
  return token;
};

export default passport.use(
  'access-jwt',
  new JwtStrategy(
    {
      algorithms: ['RS256'],
      jwtFromRequest: cookieExtractor,
      secretOrKey: ACCESS_TOKEN_PUBLIC_KEY,
    },
    async (jwt_payload, done) => {
      try {
        console.log(jwt_payload, 'jwt_payload ==>');
        const user = await authRepository.findById(jwt_payload.id);

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const authUser = new AuthUserDTO(user);

        if (user) return done(null, authUser);
        else return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
