import { AuthRepository } from '@modules/user/infrastructures/repositories/AuthRepository';
import { AppError, errorKinds } from '@utils/error-handling';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const authRepository = new AuthRepository();

export default passport.use(
  new LocalStrategy(
    { passwordField: 'password', usernameField: 'email' },
    async (email: string, password: string, done: any) => {
      try {
        const user = await authRepository.findByEmail(email);
        if (!user)
          throw AppError.new(errorKinds.invalidCredential, 'User not found.');

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
          throw AppError.new(
            errorKinds.invalidCredential,
            'Incorrect password.'
          );
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
