import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import { AuthUserDTO } from '@/modules/user/api/dtos/AuthUserDTO';
import CheckPassword from '@/modules/user/applications/usecase/auth/CheckPassword';
import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';

import AppConfig from '../app.config';

const cookieExtractor = (req: any): null | string => {
  let token: null | string = null;
  if (req?.cookies) {
    token = req.cookies['__Secure-accessToken'];
  }
  return token;
};

export class PassportConfig {
  private static _instance: PassportConfig;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): PassportConfig {
    if (!this._instance) {
      this._instance = new PassportConfig();
    }
    return this._instance;
  }

  static initialize() {
    this.getInstance();
    const checkPassword = new CheckPassword(new AuthRepository());

    const publicKey = Buffer.from(
      AppConfig.getConfig('ACCESS_TOKEN_PUBLIC_KEY'),
      'base64'
    ).toString('ascii');

    passport.use(
      'access-jwt',
      new JwtStrategy(
        {
          algorithms: ['RS256'],
          jwtFromRequest: cookieExtractor,
          secretOrKey: publicKey,
        },
        async (jwt_payload, done) => {
          try {
            const user = jwt_payload;

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

    passport.use(
      new LocalStrategy(
        { passwordField: 'password', usernameField: 'email' },
        async (email: string, password: string, done: any) => {
          try {
            const user = await checkPassword.execute(email, password);
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      )
    );

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, 'user');
    });
  }
}
