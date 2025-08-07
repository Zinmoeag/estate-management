import { IPermissionRepository } from '@/modules/user/domain/repositories/IPermissionRepository';
import { AppError, catchErrorAsync } from '@/utils/error-handling';

interface PermissionCheckInput {
  action: string;
  resource: string;
  roleID: number;
}

export class CheckRolePermission {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(params: PermissionCheckInput): Promise<boolean> {
    const [errors, permissons] = await catchErrorAsync(
      this.permissionRepository.getPermissionByRoleID(params.roleID),
      [AppError]
    );
    if (errors || !permissons) {
      throw AppError.new(
        'internalErrorServer',
        'prisma error: while getting all permissions'
      );
    }
    return permissons.some(
      (perm) =>
        perm.resource === params.resource && perm.action === params.action
    );
  }
}
