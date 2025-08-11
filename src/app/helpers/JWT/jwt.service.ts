import jwt, { SignOptions } from 'jsonwebtoken';

import AppConfig from '@/app/config/app.config';
import { AppError, errorKinds } from '@/utils/error-handling';
type PrivateKey = 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY';
type PublicKey = 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY';

type TokenKeys = PrivateKey | PublicKey;

class JwtService {
  private static ACCESS_TOKEN_PRIVATE_KEY = Buffer.from(
    AppConfig.getConfig('ACCESS_TOKEN_PRIVATE_KEY'),
    'base64'
  ).toString('ascii');
  private static ACCESS_TOKEN_PUBLIC_KEY = Buffer.from(
    AppConfig.getConfig('ACCESS_TOKEN_PUBLIC_KEY'),
    'base64'
  ).toString('ascii');
  private static REFRESH_TOKEN_PRIVATE_KEY = Buffer.from(
    AppConfig.getConfig('REFRESH_TOKEN_PRIVATE_KEY'),
    'base64'
  ).toString('ascii');
  private static REFRESH_TOKEN_PUBLIC_KEY = Buffer.from(
    AppConfig.getConfig('REFRESH_TOKEN_PUBLIC_KEY'),
    'base64'
  ).toString('ascii');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  static getToken(key: TokenKeys) {
    try {
      return this[key];

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw AppError.new(
        errorKinds.internalServerError,
        'jwt token retrieval error'
      );
    }
  }

  static signToken(key: PrivateKey, payload: any, options?: SignOptions) {
    try {
      console.log('payload ===>', this.getToken(key));
      const token = jwt.sign(payload, this.getToken(key), {
        ...(options && options),
        algorithm: 'RS256',
      });
      return token;

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw AppError.new(
        errorKinds.internalServerError,
        'jwt token signing error'
      );
    }
  }

  static verifyToken(key: PublicKey, token: string) {
    try {
      return jwt.verify(token, this.getToken(key), {
        algorithms: ['RS256'],
      });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw AppError.new(
        errorKinds.internalServerError,
        'jwt token verification error'
      );
    }
  }
}

export default JwtService;
