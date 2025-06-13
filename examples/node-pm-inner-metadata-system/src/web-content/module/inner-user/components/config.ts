export const roleTableConfig = [
  {
    attr: {
      // type: "selection",
      type: "index",
      label: "序号",
      width: 80,
      headerAlign: "center",
      align: "center",
    },
  },
  {
    attr: {
      prop: "roleName",
      label: "权限名称",
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "description",
      label: "权限说明",
      headerAlign: "center",
    },
  },
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
