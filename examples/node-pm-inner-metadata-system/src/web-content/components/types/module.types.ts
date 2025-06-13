/**
 * 模块配置默认数据
 * @type {{isDefault: boolean, code: string, moduleType: string, productId: string, name: string, icon: string, isDisabled: boolean, isVisible: boolean, type: string, sortCode: number, url: string, parentId: string}}
 */
export const defaultModuleData = {
  code: "",
  name: "",
  // "appType": "web",
  moduleType: "internal",
  url: "",
  productId: "",
  icon: "",
  sortCode: 1,
  isDisabled: false,
  isVisible: false,
  isDefault: false,
  parentId: null,
  type: "module",
  group: "",
  fullId: "",
  fullName: "",
  isLeaf: false,
  level: 1,
};

/**
 * 模块配置数据类型
 */
export interface ModuleTypes {
  id?: number;
  code: string;
  name: string;
  // appType: string;
  moduleType: string;
  url: string;
  productId: number;
  icon: string;
  sortCode: number;
  isDisabled: number;
  isVisible: number;
  isDefault: number;
  group: string;
  parentId: number;
  fullId: string;
  fullName: string;
  isLeaf: number;
}
