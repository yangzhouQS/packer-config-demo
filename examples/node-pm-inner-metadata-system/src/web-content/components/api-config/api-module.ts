import { $http } from "@cs/js-inner-web-framework";

export const apiModule = {
  // 创建模块
  createModule(params: Record<string, any>) {
    return $http.post("sys-module", params);
  },
  // 删除模块
  deleteModule(modelId: number) {
    return $http.delete(`sys-module/${modelId}`);
  },
  // 更新模块
  updateModule(modelId: number, params: Record<string, any>) {
    return $http.put(`sys-module/${modelId}`, params);
  },
};
