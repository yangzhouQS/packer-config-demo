export enum ProductEventConfig {
  /**
   * 产品刷新事件
   * @type {ProductEventConfig.productReload}
   */
  productReload = "product-reload",

  /**
   * 产品树刷新事件
   * @type {ProductEventConfig.productTreeReload}
   */
  productTreeReload = "product-tree-reload",

  /**
   * 产品添加事件
   * @type {ProductEventConfig.productAdd}
   */
  productAdd = "product-add",

  /**
   * 产品更新事件
   * @type {ProductEventConfig.productUpdate}
   */
  productUpdate = "product-update",

  /**
   * 产品删除事件
   * @deprecated
   * @type {ProductEventConfig.productRemove}
   */
  productRemove = "product-remove",

  /**
   * 产品下模块点击事件
   * @type {ProductEventConfig.productModuleClick}
   */
  productModuleClick = "product-module-click",

  /**
   * 产品激活事件
   * @type {ProductEventConfig.productActive}
   */
  productActive = "product-active",
}

export const moduleFlexConfig = [
  {
    attr: {
      type: "index",
      label: "序号",
      width: 60,
      headerAlign: "center",
      align: "center",
      fixed: "left",
    },
  },
  {
    attr: {
      prop: "isDisabled",
      label: "状态",
      width: 80,
      headerAlign: "center",
      scopedSlot: "isDisabled",
      align: "center",
    },
  },
  {
    attr: {
      prop: "name",
      label: "名称",
      width: 220,
      headerAlign: "center",
      scopedSlot: "name",
    },
  },
  {
    attr: {
      prop: "code",
      label: "编码",
      width: 200,
      headerAlign: "center",
    },
  },
  /* {
    attr: {
      prop: "group",
      label: '分组',
      width: 140,
      headerAlign: "center",
    }
  }, */
  {
    attr: {
      prop: "type",
      label: "类型",
      width: 90,
      headerAlign: "center",
      scopedSlot: "type",
      align: "center",
    },
  },
  {
    attr: {
      prop: "moduleType",
      label: "模块类型",
      width: 120,
      headerAlign: "center",
      scopedSlot: "moduleType",
      align: "center",
    },
  },
  {
    attr: {
      prop: "url",
      label: "模块地址",
      width: 220,
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "sortCode",
      label: "排序",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
  },
  {
    attr: {
      prop: "modifierName",
      label: "更新人",
      width: 140,
      headerAlign: "center",
    },
  },
  {
    attr: {
      prop: "modifierAt",
      label: "更新时间",
      width: 180,
      align: "center",
      headerAlign: "center",
      scopedSlot: "modifierAt",
    },
  },
  {
    attr: {
      scopedSlot: "designPC",
      fixed: "right",
      width: 100,
      label: "操作",
      align: "center",
      headerAlign: "center",
    },
  },
];
