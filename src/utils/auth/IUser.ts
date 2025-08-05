export interface IUser {
  createdAt: Date;
  email: string;
  id: number;
  password: string;
  roleId: number;
  updatedAt: Date;
  username?: string;
  // Add other user fields as needed
}
