export const defaultPermissionData = {
  name: "",
  code: "",
  description: "",
  moduleId: 0,
};

export interface PermissionTypes {
  id?: number;
  name: string;
  code: string;
  description: string;
  moduleId: number;
  isRemoved?: boolean;
}
