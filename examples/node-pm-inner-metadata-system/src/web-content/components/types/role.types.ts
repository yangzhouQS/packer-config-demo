export const defaultRoleData = {
  name: "",
  isDisabled: false,
  description: "",
};

export interface RoleTypes {
  id: number;
  name: string;
  isDisabled: boolean;
  description: string;
}

export interface RoleActiveParams {
  roleId?: string;
}
