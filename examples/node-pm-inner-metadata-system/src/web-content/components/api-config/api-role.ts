import { $http } from "@cs/js-inner-web-framework";

export const apiRole = {
  // 查询角色下所有权限项
  findRolePermissions(roleId: number) {
    return $http.get(`sys-role/${roleId}/role-permissions`);
  },

  // 创建角色
  createRole(params: Record<string, any>) {
    return $http.post("sys-role", params);
  },

  updateRole(roleId: number, params: Record<string, any>) {
    return $http.put(`sys-role/${roleId}/update-role`, params);
  },

  // 查询所有角色
  queryRoles() {
    return $http.get("sys-role/roles");
  },

  // 查询产品下所有模块权限项
  queryProductModulePermission(productId: string) {
    return $http.get(`sys-role/${productId}/product/permissions`);
  },

  // 角色关联权限项
  roleRelationPermission(body: any) {
    return $http.post(`sys-role/role-relation-permission`, body);
  },

  // 用户关联角色
  userRelationRole(body: any) {
    return $http.post(`sys-role/user-relation-role`, body);
  },

  // 删除用户关联的角色
  removeUserRelationRole(body: any) {
    return $http.post(`sys-role/remove-user-roles`, body);
  },

  // 删除角色下分配权的限项
  removeRolePermission(roleId: number, body: any) {
    return $http.delete(`sys-role/${roleId}/role-permission/delete`, body);
  },

  // 删除角色
  removeRole(roleId: number) {
    return $http.delete(`sys-role/${roleId}/remove-role`);
  },

  // 根据用户id查询分配的所有权限信息
  findUserRoles(userId: number) {
    return $http.get(`sys-role/${userId}/user-roles`);
  },

  // 产品名称和产品编码校验
  validateRole(body: Record<string, any>) {
    return $http.post("sys-role/validate-role", body);
  },
};
