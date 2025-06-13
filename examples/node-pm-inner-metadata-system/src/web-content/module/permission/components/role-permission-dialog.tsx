import { Close, Search } from "@element-plus/icons-vue";
import { cloneDeep, filter, find, map, trim } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { apiProduct } from "../../../components/api-config/api-product";
import { apiRole } from "../../../components/api-config/api-role";
import { GlobalMessage } from "../../../components/global/global-message";
import { ProductTypes } from "../../../components/types/product.types";
import { searchTree } from "../../../utils/funcs/search-tree";
import { toArrayTree } from "../../../utils/funcs/to-array-tree";
import { toTreeArray } from "../../../utils/funcs/to-tree-array";
import { catchMessage, errorMessage, roleEvent } from "../../../utils/utils";

export const RolePermissionDialog = defineComponent({
  name: "RolePermissionDialog",
  props: {
    currentRole: {
      type: Object,
      default: () => {
        return {};
      },
    },
    currentPermissions: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const treeRef = ref();
    const treeTableData = ref([]);
    const treeTableList = ref([]);
    const treeTableConfig = [
      {
        attr: {
          prop: "selCode",
          label: "",
          treeNode: true,
          type: "selection",
          width: 120,
          align: "center",
          disabled: ({ row }) => {
            const isValid = find(props.currentPermissions, (item: any) => item.permissionId === row.id);
            return !isValid;
          },
        },
      },
      { attr: { prop: "permissionName", label: "模块-权限项名称", scopedSlot: "permissionName" } },
      { attr: { prop: "permissionCode", label: "模块-权限项编码", scopedSlot: "permissionCode" } },
    ];

    const state = reactive({
      saveLoading: false,
      products: [],
      productList: [] as any,
      productNameOrCode: "",
      moduleNameOrCode: "",
      currentProduct: {} as any,
    });
    const methods = {
      handleClose: () => {
        roleEvent.emit("close-role-permission-dialog");
      },
      saveForm: () => {
        const rows = treeRef.value.getCheckboxRecords();
        const selectRows = filter(rows, (item) => {
          return item.type === "permission";
        });
        if (selectRows.length > 0) {
          methods.createUserPermission(selectRows);
        }
        else {
          GlobalMessage.info("请选择要挂接的权限");
        }
      },
      handleSelectChange: () => {
        // console.log(row);
      },
      createUserPermission: (selectRows) => {
        const params = {
          roleId: props.currentRole.id,
          permissions: selectRows.map((item) => {
            return {
              id: item.id,
              moduleId: item.moduleId,
              permissionCode: item.permissionCode,
              permissionName: item.permissionName,
              type: item.type,
              moduleName: item.moduleName,
              moduleCode: item.moduleCode,
            };
          }),
        };
        state.saveLoading = true;
        apiRole.roleRelationPermission(params).then(() => {
          GlobalMessage.success("添加权限项成功");
          roleEvent.emit("close-role-permission-dialog", true);
        }).catch(catchMessage("角色分配权限操作失败")).finally(() => {
          state.saveLoading = false;
        });
      },
      loadProduct: () => {
        apiProduct.queryProducts().then(({ result }) => {
          state.products = result;
          methods.searchProduct();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "产品查询失败"));
        });
      },
      loadPermissions: (productId: string) => {
        apiRole.queryProductModulePermission(productId).then(({ result }) => {
          treeTableList.value = result;
          methods.searchModule();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "产品查询失败"));
        });
      },
      /* 产品搜索 */
      searchProduct: () => {
        const searchVal = trim(state.productNameOrCode).toString().toLowerCase();
        if (searchVal) {
          state.productList = filter(state.products, (item) => {
            return `${item.name}`.toLowerCase().includes(searchVal) || `${item.code}`.toLowerCase().includes(searchVal) || false;
          });
        }
        else {
          state.productList = state.products;
        }
      },
      /* 模块搜索 */
      searchModule: () => {
        const searchVal = trim(state.moduleNameOrCode).toString().toLowerCase();

        if (searchVal) {
          // 转换为树
          const treeData = toArrayTree(treeTableList.value);
          // 树形搜索
          const newTreeData = searchTree(treeData, (item) => {
            const text = `${item.moduleCode}|${item.moduleName}|${item.permissionCode}|${item.permissionName}`.toLowerCase();
            return text.includes(searchVal);
          });

          // 树形结构转换为数组
          treeTableData.value = toTreeArray(newTreeData);
        }
        else {
          treeTableData.value = treeTableList.value;
        }
      },
      menuItem: (productItem: ProductTypes) => {
        state.currentProduct = cloneDeep(productItem);
        methods.loadPermissions(productItem.id);
      },
      checkMethod: ({ row }) => {
        const permissionIds = map(props.currentPermissions, "permissionId");
        const isValid = find(props.currentPermissions, (item: any) => item.permissionId === row.id);

        // 模块下必须存在没有禁用的才可以选择
        if (row.type === "module") {
          // 所有子集
          const children = filter(treeTableList.value, item => item.parentId === row.id);
          // 至少存在一个没有进行授权
          const isSelect = find(children, item => !permissionIds.includes(item.id));
          return isSelect && !isValid;
        }
        return !isValid;
      },
      visibleMethod: ({ row }) => {
        const permissionIds = map(props.currentPermissions, "permissionId");
        const isValid = permissionIds.includes(row.id);

        // 模块下必须存在没有禁用的才可以选择
        if (row.type === "module") {
          // 所有子集
          const children = filter(treeTableList.value, item => item.parentId === row.id);
          // 至少存在一个没有进行授权
          return find(children, item => !permissionIds.includes(item.id));
        }
        return !isValid;
      },
    };
    onMounted(() => {
      methods.loadProduct();
    });
    return () => {
      return (
        <flex-box
          isRow={true}
          itemNum={2}
          height="75vh"
          itemConfig={[
            {
              tag: "item-1",
              isFixed: true,
              size: "260px",
              paddingSize: "large",
              clearPadding: ["right"],
            },
            {
              tag: "item-2",
              isFixed: false,
              size: "",
              paddingSize: "large",
              clearPadding: ["bottom"],
            },
          ]}
        >
          {{
            "item-1": () => {
              return (
                <panel border={true} show-header={true}>
                  {{
                    tool: () => {
                      return (
                        <flex-line left-width="100%" left-padding={true}>
                          <el-input
                            class="flex-1"
                            v-model={state.productNameOrCode}
                            placeholder="按产品名称或编码搜索"
                            suffix-icon={Search}
                            onInput={methods.searchProduct}
                            clearable
                          />
                        </flex-line>
                      );
                    },
                    default: () => {
                      return (
                        <box padding-size="small">
                          <el-scrollbar>
                            <el-menu class={["product-item-container"]}>
                              {state.productList.map((item, index) => {
                                return (
                                  <el-menu-item
                                    disabled={state.saveLoading}
                                    index={index}
                                    class={["product-item"]}
                                    onClick={methods.menuItem.bind(null, item)}
                                  >
                                    {item.name}
                                  </el-menu-item>
                                );
                              })}
                            </el-menu>
                          </el-scrollbar>
                        </box>
                      );
                    },
                  }}
                </panel>
              );
            },
            "item-2": () => {
              return (
                <flex-box
                  isRow={false}
                  itemNum={2}
                  itemConfig={[
                    {
                      tag: "item-1",
                      isFixed: false,
                      size: "",
                      paddingSize: "base",
                      clearPadding: ["left", "top", "right"],
                    },
                    {
                      tag: "item-2",
                      isFixed: true,
                      size: "",
                      paddingSize: "base",
                      clearPadding: ["left", "top", "right"],
                    },
                  ]}
                >
                  {{
                    "item-1": () => {
                      return (
                        <panel show-header={true} border={true} padding-size="base">
                          {{
                            tool: () => {
                              return (
                                <flex-line left-padding={true}>
                                  {{
                                    default: () => {
                                      return (
                                        <el-input
                                          style={{ width: "220px" }}
                                          v-model={state.moduleNameOrCode}
                                          placeholder="模块名称或编码搜索"
                                          clearable
                                          onInput={methods.searchModule}
                                        />
                                      );
                                    },
                                  }}
                                </flex-line>
                              );
                            },
                            default: () => {
                              return (
                                <tree-table
                                  ref={treeRef}
                                  table-data={treeTableData.value}
                                  column-configs={treeTableConfig}
                                  onSelectChange={methods.handleSelectChange}
                                  checkboxConfig={{
                                    labelField: "selCode",
                                    checkMethod: methods.checkMethod,
                                    visibleMethod: methods.visibleMethod,
                                  }}
                                  row-config={{ keyField: "id" }}
                                  tree-config={
                                    {
                                      lazy: false,
                                      rowField: "id",
                                      parentField: "parentId",
                                      expandAll: false,
                                      showLine: true,
                                    }
                                  }
                                >
                                  {{
                                    permissionName: ({ row }) => {
                                      if (row.type === "module") {
                                        return row.moduleName;
                                      }
                                      if (row.type === "permission") {
                                        return row.permissionName;
                                      }
                                    },
                                    permissionCode: ({ row }) => {
                                      if (row.type === "module") {
                                        return row.moduleCode;
                                      }
                                      if (row.type === "permission") {
                                        return row.permissionCode;
                                      }
                                    },
                                  }}
                                </tree-table>
                              );
                            },
                          }}
                        </panel>
                      );
                    },
                    "item-2": () => {
                      return (
                        <box padding-size="base">
                          <flex-line>
                            {{
                              right: () => {
                                return (
                                  <>
                                    <el-button
                                      type="primary"
                                      text={true}
                                      size="default"
                                      plain={true}
                                      onClick={methods.handleClose}
                                      icon={Close}
                                    >
                                      取消
                                    </el-button>
                                    <el-button
                                      type="primary"
                                      onClick={methods.saveForm}
                                      disabled={state.saveLoading}
                                      loading={state.saveLoading}
                                    >
                                      <i class="cs-common baocun el-icon--left"></i>
                                      确定
                                    </el-button>
                                  </>
                                );
                              },
                            }}
                          </flex-line>
                        </box>
                      );
                    },
                  }}
                </flex-box>
              );
            },
          }}
        </flex-box>
      );
    };
  },
});
