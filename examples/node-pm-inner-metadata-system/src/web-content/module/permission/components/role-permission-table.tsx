import { frameStore } from "@cs/js-inner-web-framework";
import { Delete, Plus, Search } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { cloneDeep, filter, trim } from "lodash";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { apiRole } from "../../../components/api-config/api-role";
import { GlobalMessage } from "../../../components/global/global-message";
import { defaultRoleData, RoleTypes } from "../../../components/types/role.types";
import { errorMessage, formatDate, roleEvent } from "../../../utils/utils";
import { permissionTableConfig, RoleEventConfig } from "./role-config";
import { RoleHeaderInfo } from "./role-header-info";
import { RolePermissionDialog } from "./role-permission-dialog";

/**
 * 模块表格和添加
 */
export const RolePermissionTable = defineComponent({
  name: "RolePermissionTable",
  setup() {
    const permissions = frameStore.$context?.permissions || [];

    const tableLoading = ref(false);
    const tableRef = ref();
    const tableOnlyRef = ref(null);
    const tableData = ref([]);

    const state = reactive({
      searchVal: "",
      currentPermissions: [], // 当前角色对应所有模块
      currentRole: {} as RoleTypes,
      currentRow: {} as any,
      removeVisible: false,
      dialogVisible: false,
      disabledRemove: true,
    });

    const proDisabled = computed(() => {
      return !(state.currentRole.id > 0);
    });

    const methods = {
      /* 添加模块 */
      add: () => {
        if (!state.currentRole.id) {
          GlobalMessage.info("请先选择左侧角色");
          return false;
        }
        state.currentRow = cloneDeep(defaultRoleData);
        state.currentRow.productId = state.currentRole.id;

        state.dialogVisible = true;
      },
      /* 单个模块编辑 */
      edit: (row) => {
        state.currentRow = cloneDeep(row);
        state.dialogVisible = true;
      },
      /* 单个权限项删除 */
      rowRemove: (row) => {
        ElMessageBox.confirm(
          `是否删除权限项：${row.permissionName}`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            apiRole.removeRolePermission(state.currentRole.id, { permissions: [row] }).then(() => {
              GlobalMessage.success("权限项删除成功");
              methods.handleClose();
              methods.loadData();
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "权限项删除失败"));
            });
          })
          .catch(() => {
          });
      },
      /* 根据产品id加载下属模块 */
      loadData: () => {
        apiRole.findRolePermissions(state.currentRole.id).then(({ result }) => {
          const { permissions, role } = result;
          if (state.currentRole.id === role.id) {
            state.currentPermissions = permissions;
            methods.filterModule();
          }
        }).catch((error) => {
          console.log(error);
        });
      },
      /* 模块过滤搜索 */
      filterModule: () => {
        const txt = trim(state.searchVal).toLowerCase();
        if (txt) {
          tableData.value = filter(cloneDeep(state.currentPermissions), (item) => {
            return `${item.permissionName}`.toLowerCase().includes(txt) || `${item.permissionCode}`.toLowerCase().includes(txt) || false;
          });
        }
        else {
          tableData.value = state.currentPermissions;
        }
      },
      /* 点击左侧产品 */
      clickRole: (item: RoleTypes) => {
        state.currentRole = item || {} as RoleTypes;
        methods.loadData();
      },
      handleSelectChange: (rows) => {
        state.disabledRemove = !(rows.length > 0);
      },
      handleClose: (isReload = false) => {
        state.currentRow = cloneDeep(defaultRoleData);
        state.dialogVisible = false;
        state.removeVisible = false;

        if (isReload) {
          methods.loadData();
        }
      },
      clearRole: () => {
        tableData.value = [];
      },
      renderModule: () => {
        return (
          <el-dialog
            title="挂接权限项"
            draggable={true}
            v-model={state.dialogVisible}
            width="50%"
            top="10vh"
            append-to-body={true}
            destroy-on-close={true}
            close-on-click-modal={false}
            before-close={methods.handleClose}
          >
            {state.dialogVisible && (
              <RolePermissionDialog
                currentRole={state.currentRole}
                currentPermissions={state.currentPermissions}
              />
            )}
          </el-dialog>
        );
      },
    };
    onMounted(() => {
      roleEvent.on("click-role", methods.clickRole);
      roleEvent.on("close-role-permission-dialog", methods.handleClose);

      roleEvent.on(RoleEventConfig.roleRemove, methods.clearRole);

      tableRef.value = tableOnlyRef.value.getNativeRefs();
    });
    return () => {
      return (
        <>
          {methods.renderModule()}
          <flex-box
            isRow={false}
            itemNum={2}
            itemConfig={[
              {
                tag: "item-1",
                isFixed: true,
                size: "",
                paddingSize: "large",
                clearPadding: ["left", "top", "right"],
              },
              {
                tag: "item-2",
                isFixed: false,
                size: "",
                paddingSize: "large",
                clearPadding: ["left", "top", "right", "bottom"],
              },
            ]}
          >
            {{
              "item-1": () => {
                return <RoleHeaderInfo activeRole={state.currentRole} />;
              },
              "item-2": () => {
                return (
                  <box
                    padding-size="small"
                    background={true}
                    border={false}
                    height="100%"
                    clear-padding={[]}
                    clear-border={[]}
                  >
                    <panel border={true} show-header={true}>
                      {{
                        tool: () => {
                          return (
                            <flex-line
                              left-padding={true}
                              right-padding={true}
                              left-clear-padding={[]}
                              right-clear-padding={[]}
                            >
                              {{
                                default: () => {
                                  return permissions.includes("pm-inner-metadata-permission-create") && (
                                    <el-button
                                      type="primary"
                                      icon={Plus}
                                      onClick={methods.add}
                                      disabled={proDisabled.value}
                                    >
                                      权限项
                                    </el-button>
                                  );
                                },
                                right: () => {
                                  return (
                                    <el-input
                                      style={{ width: "240px" }}
                                      v-model={state.searchVal}
                                      clearable={true}
                                      onInput={methods.filterModule}
                                      placeholder="按名称或编码搜索"
                                      suffix-icon={Search}
                                    />
                                  );
                                },
                              }}
                            </flex-line>
                          );
                        },
                        default: () => {
                          return (
                            <box padding-size="small">
                              <table-only
                                ref={tableOnlyRef}
                                table-data={tableData.value}
                                table-loading={tableLoading.value}
                                column-configs={permissionTableConfig}
                                onSelectionChange={methods.handleSelectChange}
                                onRowClick={(row) => {
                                  tableRef.value!.toggleRowSelection(row, undefined);
                                }}
                              >
                                {{
                                  createdAt: ({ row }: any) => {
                                    return row.createdAt && formatDate(row.createdAt);
                                  },
                                  modifiedAt: ({ row }: any) => {
                                    return row.modifiedAt && formatDate(row.modifiedAt);
                                  },
                                  name: ({ row }: any) => {
                                    return (
                                      <el-button
                                        onClick={methods.edit.bind(null, row)}
                                        type="primary"
                                        size="small"
                                        plain
                                        text={true}
                                      >
                                        {row.name}
                                      </el-button>
                                    );
                                  },
                                  delete: ({ row }: any) => {
                                    return (
                                      <el-button
                                        type="danger"
                                        plain={true}
                                        link={true}
                                        size="small"
                                        icon={Delete}
                                        disabled={!permissions.includes("pm-inner-metadata-permission-remove")}
                                        onClick={() => {
                                          methods.rowRemove(row);
                                        }}
                                      >
                                        删除
                                      </el-button>
                                    );
                                  },
                                }}
                              </table-only>
                            </box>
                          );
                        },
                      }}
                    </panel>
                  </box>
                );
              },
            }}
          </flex-box>
        </>
      );
    };
  },
});
