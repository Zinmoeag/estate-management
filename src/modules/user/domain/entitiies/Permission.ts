export class Permission {
  action: string;
  id: Number;
  resource: string;
  // roles?: RolePermission[];

  constructor(params: {
    action: string;
    id: Number;
    resource: string;
    // roles?: RolePermission[];
  }) {
    this.id = params.id;
    this.action = params.action;
    this.resource = params.resource;
    // this.roles = params.roles;
  }
}
