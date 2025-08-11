import JwtService from '@/app/helpers/JWT/jwt.service';
import { AuthUserDTO } from '@/modules/user/api/dtos/AuthUserDTO';
import { IAuthRepository } from '@/modules/user/domain/repositories/IAuthRepository';

export class LoginUseCase {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(params: AuthUserDTO) {
    const accessToken = JwtService.signToken(
      'ACCESS_TOKEN_PRIVATE_KEY',
      params,
      {
        expiresIn: '15m',
      }
    );
    const refreshToken = JwtService.signToken(
      'REFRESH_TOKEN_PRIVATE_KEY',
      params,
      {
        expiresIn: '7d',
      }
    );

    return { accessToken: 'd', refreshToken: 'd' };
  }
}
