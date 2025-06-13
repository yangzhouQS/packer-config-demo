import { $http } from "@cs/js-inner-web-framework";

export const apiProduct = {
  // 查询产品下所有模块
  findProductModules(productId: number) {
    return $http.get(`sys-product/${productId}/modules`);
  },

  // 创建产品
  createProduct(params: Record<string, any>) {
    return $http.post("sys-product", params);
  },

  // 更新产品
  updateProduct(productId: string, params: Record<string, any>) {
    return $http.put(`sys-product/${productId}/update`, params);
  },

  // 删除产品
  removeProduct(productId: string) {
    return $http.delete(`sys-product/${productId}/remove`);
  },

  // 查询所有产品
  queryProducts() {
    return $http.get("sys-product/products");
  },

  // 查询产品和模块组成的菜单
  queryProductTree(productId: string) {
    return $http.get(`sys-product/${productId}/product-tree`);
  },

  // 查询产品下模块或分组或模块，参数作为过滤条件
  findProductChild(body: Record<string, any>) {
    return $http.post("sys-product/product-child", body);
  },

  // 产品名称和产品编码校验
  validateProduct(body: Record<string, any>) {
    return $http.post("sys-product/validate-product", body);
  },
};
