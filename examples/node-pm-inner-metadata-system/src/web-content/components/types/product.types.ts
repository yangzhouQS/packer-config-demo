/**
 * @description 产品类型
 */
export interface ProductTypes {
  id: string;
  name: string;
  code: string;
  isDisabled: number;
  icon: string;
}

/**
 * 从配置默认数据
 * @type {{code: string, name: string, icon: string, isDisabled: boolean}}
 */
export const defaultProductConfig = {
  name: "",
  code: "",
  productType: "web",
  isDisabled: false,
  icon: "",
  sortCode: 1,
};

export interface ProductActiveParams {
  productId?: string;
  moduleId?: string;
}
