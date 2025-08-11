import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';

import CheckPassword from '../../applications/usecase/auth/CheckPassword';

const authRepository = new AuthRepository();
const checkPassword = new CheckPassword(authRepository);

export default passport.use(
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
