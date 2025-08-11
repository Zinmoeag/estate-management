import bcrypt from 'bcrypt';

import { AuthUserDTO } from '@/modules/user/api/dtos/AuthUserDTO';
import { AuthRepository } from '@/modules/user/infrastructures/repositories/AuthRepository';
import { AppError, errorKinds } from '@/utils/error-handling';

class CheckPassword {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUserDTO> {
    const user = await this.authRepository.findByEmail(email);
    if (!user)
      throw AppError.new(errorKinds.invalidCredential, 'User not found.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw AppError.new(errorKinds.invalidCredential, 'Incorrect password.');

    return new AuthUserDTO(user);
  }
}

export default CheckPassword;
