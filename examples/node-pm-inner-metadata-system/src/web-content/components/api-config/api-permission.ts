import { $http } from "@cs/js-inner-web-framework";

export const apiPermission = {
  // 查询
  queryPermission(moduleId: number) {
    return $http.get("sys-permission", { params: { moduleId } });
  },
  // 创建
  createPermission(params: Record<string, any>) {
    return $http.post("sys-permission", params);
  },
  // 删除
  deletePermission(modelId: number) {
    return $http.delete(`sys-permission/${modelId}`);
  },
  // 更新
  updatePermission(modelId: number, params: Record<string, any>) {
    return $http.put(`sys-permission/${modelId}`, params);
  },
  validatePermission(params: Record<string, any>) {
    return $http.post(`sys-permission/validate-permission`, params);
  },
};
