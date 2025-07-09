/**
 * 权限项接口
 */
export interface PublicPermissionItemType {
  id: number;
  name: string;
  code: string;
  moduleId: number;
}

/**
 * 角色类型接口
 */
export interface PublicRoleType {
  id: number;
  name: string;
  isDisabled?: boolean;
}

/**
 * 模块数据格式约束
 */
export interface PublicModuleType {
  id: number;
  code: string;
  name: string;
  // appType: string;
  moduleType: string;
  url: string;
  productId: number;
  parentId: number;
  icon: string;
  sortNum: number;
  isDisabled: number;
  isVisible: number;
  isDefault: number;
  group: string;
  creatorId?: any;
  creatorName?: any;
  modifierId?: any;
  modifierName?: any;
  createdAt?: any;
  updatedAt?: any;
  version?: any;
  isRemoved: boolean;
}
