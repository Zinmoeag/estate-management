import { NextFunction, Request, Response } from 'express';

import { LogoutUseCase } from '@/modules/user/applications/usecase/auth/LogoutUseCase';
import { RegisterUseCase } from '@/modules/user/applications/usecase/auth/RegisterUseCase';
import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';
import { AppError, catchErrorAsync, errorKinds } from '@/utils/error-handling';

import { AuthUserDTO } from '../dtos/AuthUserDTO';
// import { AuthRepository } from 'modules/user/infrastructures/repositories/AuthRepository';
import { LoginUseCase } from './../../applications/usecase/auth/LoginUseCase';
import { RefreshAccessTokenUseCase } from './../../applications/usecase/auth/RefreshAccessTokenUseCase';
export class AuthController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { email, password, username } = req.body;

    console.log(req.body);

    const registerUseCase = new RegisterUseCase(new AuthRepository());
    const [error, result] = await catchErrorAsync(
      registerUseCase.execute({ email, password, username })
    );

    // console.log(result);

    if (error) {
      next(error);
      return;
    }

    res.status(201).json({
      user: result,
    });
  }

  // eslint-disable-next-line no-unused-vars
  async getUser(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) throw AppError.new(errorKinds.notAuthorized, 'Unauthorized');

    res.status(200).json(user);
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const loginUseCase = new LoginUseCase(new AuthRepository());
    const [error, result] = await catchErrorAsync(
      loginUseCase.execute({
        ...(req.user as AuthUserDTO),
      })
    );

    if (error) {
      next(error);
      return;
    }

    if (!result)
      return next(AppError.new(errorKinds.badRequest, 'Login failed'));

    res.cookie('__Secure-accessToken', result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      path: '/',
      sameSite: 'none',
      secure: true,
    });

    res.cookie('__Secure-refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'none',
      secure: true,
    });

    res.status(200).json({
      message: 'Login success',
    });
  }

  // eslint-disable-next-line no-unused-vars
  async logout(req: Request, res: Response, next: NextFunction) {
    const { id }: { id: number } = req.user as { id: number };

    const logoutUseCase = new LogoutUseCase(new AuthRepository());

    if (!id) throw AppError.new('invalidToken', 'No userId');

    await logoutUseCase.execute(id);

    res.status(204).json({ message: 'Logout success' });
  }

  // eslint-disable-next-line no-unused-vars
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;

    console.log(refreshToken);

    if (!refreshToken)
      throw AppError.new(errorKinds.notFound, 'Token is not found');

    const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(
      new AuthRepository()
    );

    const newAccessToken = await refreshAccessTokenUseCase.execute(
      refreshToken
    );
    res.status(200).json(newAccessToken);
  }
}
