export const permissionTableConfig = [
  {
    attr: {
      type: "index",
      label: "序号",
      width: 80,
      headerAlign: "center",
      align: "center",
    },
  },
  {
    attr: {
      prop: "permissionName",
      label: "权限项名称",
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "permissionCode",
      label: "权限项编码",
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "moduleName",
      label: "所属模块",
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "moduleCode",
      label: "模块编码",
      headerAlign: "center",
    },
  },
  /* {
    attr: {
      prop: "productName",
      label: "所属产品",
      headerAlign: "center"
    }
  },
  {
    attr: {
      prop: "productCode",
      label: "产品编码",
      headerAlign: "center",
    }
  }, */
  {
    attr: {
      scopedSlot: "delete",
      fixed: "right",
      width: 100,
      label: "操作",
      align: "center",
      headerAlign: "center",
    },
  },
];

export const RoleEventConfig = {
  roleAdd: "role-add",
  roleUpdate: "role-update",
  /**
   * 删除角色
   */
  roleRemove: "role-remove",

  /**
   * 重新加载角色
   */
  roleReload: "role-reload",
  roleActive: "role-active",
  roleModuleClick: "role-module-click",
};
