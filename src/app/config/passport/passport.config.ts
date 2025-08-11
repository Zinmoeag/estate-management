import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import { AuthUserDTO } from '@/modules/user/api/dtos/AuthUserDTO';
import CheckPassword from '@/modules/user/applications/usecase/auth/CheckPassword';
import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';

import AppConfig from '../app.config';

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

    passport.use(
      'access-jwt',
      new JwtStrategy(
        {
          algorithms: ['RS256'],
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: AppConfig.getConfig('ACCESS_TOKEN_PUBLIC_KEY'),
        },
        async (jwt_payload, done) => {
          try {
            const user = {};

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
            console.log('user ===>', user);
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
