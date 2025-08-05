export class AuthUserDTO {
  createdAt: Date;
  email: string;
  id: number;
  roleId: number;
  updatedAt: Date;
  username: string;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.roleId = user.roleId;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
