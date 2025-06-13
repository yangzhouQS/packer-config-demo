import { frameStore } from "@cs/js-inner-web-framework";
import { Delete, Plus, Search } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { cloneDeep, filter, trim } from "lodash";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { apiRole } from "../../../components/api-config/api-role";
import { apiUser } from "../../../components/api-config/api-user";
import { GlobalMessage } from "../../../components/global/global-message";
import { IconRole } from "../../../components/icons";
import { catchMessage, errorMessage, formatDate, userEvent } from "../../../utils/utils";
import { roleTableConfig } from "./config";
import { UserRoleDialog } from "./user-role-dialog";

/**
 * 模块表格和添加
 */
export const RoleTable = defineComponent({
  name: "RoleTable",
  setup() {
    const permissions = frameStore.$context?.permissions || [];
    const tableLoading = ref(false);
    const tableRef = ref();
    const tableOnlyRef = ref(null);
    const tableData = ref([]);

    const state = reactive({
      searchVal: "",
      currentRoles: [], // 用户用户已经分配的所有角色
      currentUser: {} as any,
      removeVisible: false,
      dialogVisible: false,
      saveLoading: false,
      disabledRemove: true,
    });

    const proDisabled = computed(() => {
      return !(state.currentUser.id > 0);
    });

    const methods = {
      /* 添加模块 */
      add: () => {
        if (!state.currentUser.id) {
          GlobalMessage.info("请先选择左侧用户");
          return false;
        }
        state.dialogVisible = true;
      },
      /* 删除用户 */
      rowRemoveUser: () => {
        ElMessageBox.confirm(
          `是否删除用户：${state.currentUser.name}，同时删除用户相关权限`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            console.log(state.currentUser);
            apiUser.removeOperatorUser(state.currentUser).then(() => {
              GlobalMessage.success("删除用户成功");
              methods.clearUser();
              userEvent.emit("reload-user");
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "用户删除失败"));
            });
          })
          .catch(catchMessage("用户删除失败"));
      },
      clearUser: () => {
        state.currentUser = {};
        state.currentRoles = [];
        tableData.value = [];
      },
      /* 单条删除用户权限 */
      rowRemove: (row) => {
        ElMessageBox.confirm(
          `是否删除权限：${row.roleName}`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            const params = {
              userId: state.currentUser.id,
              roles: [row],
            };
            apiRole.removeUserRelationRole(params).then(() => {
              GlobalMessage.success("权限项删除成功");
              methods.handleClose();
              methods.loadData();
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "权限删除失败"));
            });
          })
          .catch(() => {

          });
      },
      /* 批量删除用户权限 */
      removeUserRoles: () => {
        const selectRows = tableRef.value!.getSelectionRows();
        if (selectRows.length === 0) {
          GlobalMessage.info("请选择要删除的权限");
          return;
        }
        const params = {
          userId: state.currentUser.id,
          roles: selectRows,
        };
        apiRole.removeUserRelationRole(params).then(() => {
          GlobalMessage.success("权限删除成功");
          methods.handleClose();
          methods.loadData();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "权限删除失败"));
        });
      },
      /* 根据用户id查询当前用户所分配的角色信息 */
      loadData: () => {
        if (!state.currentUser.id) {
          GlobalMessage.info("未选择用户");
          return;
        }
        apiRole.findUserRoles(state.currentUser.id).then(({ result }) => {
          const { userId, roles } = result;
          if (state.currentUser.id === userId) {
            state.currentRoles = roles;
            methods.filterRole();
          }
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "用户分配角色查询失败"));
        });
      },
      /* 模块过滤搜索 */
      filterRole: () => {
        const txt = trim(state.searchVal).toLowerCase();
        if (txt) {
          tableData.value = filter(cloneDeep(state.currentRoles), (item) => {
            return `${item.roleName}`.toLowerCase().includes(txt);
          });
        }
        else {
          tableData.value = state.currentRoles;
        }
      },
      /* 点击左侧用户 */
      clickUser: (item) => {
        if (item && item.id) {
          state.currentUser = item;
        }
        methods.loadData();
      },
      handleSelectChange: (rows) => {
        state.disabledRemove = !(rows.length > 0);
      },
      handleClose: (isReload = false) => {
        state.dialogVisible = false;
        state.removeVisible = false;

        if (isReload) {
          methods.loadData();
        }
      },
      renderDialog: () => {
        if (!state.dialogVisible) {
          return null;
        }
        return (
          <el-dialog
            title="用户分配权限"
            draggable={true}
            v-model={state.dialogVisible}
            width="50%"
            append-to-body={true}
            destroy-on-close={true}
            close-on-click-modal={false}
            before-close={methods.handleClose}
          >
            {state.dialogVisible && (
              <UserRoleDialog
                currentUser={state.currentUser}
                currentRoles={state.currentRoles}
              />
            )}
          </el-dialog>
        );
      },
    };
    onMounted(() => {
      userEvent.on("click-user", methods.clickUser);
      userEvent.on("close-user-role-dialog", methods.handleClose);
      userEvent.on("user-relation-role", methods.add);
      tableRef.value = tableOnlyRef.value.getNativeRefs();
    });
    return () => {
      return (
        <>
          {methods.renderDialog()}
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
                return (
                  <box
                    padding-size="base"
                    background={true}
                    border={false}
                    clear-padding={[]}
                    clear-border={[]}
                    class="header-bg-color"
                  >
                    <flex-line left-padding={false} right-padding={false}>
                      {{
                        default: () => {
                          return (
                            <div class="d-flex align-center">
                              <span>
                                <IconRole class="mr-2" />
                              </span>
                              {
                                state.currentUser.id > 0 && (
                                  <>
                                    <span>{state.currentUser.name}</span>
                                  </>
                                )
                              }
                            </div>
                          );
                        },
                        right: () => {
                          if (!permissions.includes("pm-inner-metadata-inner-user-remove")) {
                            return null;
                          }
                          return (
                            <span>
                              <el-button
                                type="danger"
                                plain
                                disabled={!(state.currentUser.id > 0)}
                                icon={Delete}
                                onClick={methods.rowRemoveUser}
                              >
                                删除用户
                              </el-button>
                            </span>
                          );
                        },
                      }}
                    </flex-line>
                  </box>
                );
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
                                  if (!permissions.includes("pm-inner-metadata-inner-user-permission")) {
                                    return null;
                                  }
                                  return (
                                    <el-button
                                      type="primary"
                                      icon={Plus}
                                      onClick={methods.add}
                                      disabled={proDisabled.value}
                                    >
                                      分配权限
                                    </el-button>
                                  );
                                /* return <>
                                  <EmptyDanger/>
                                  <el-popover
                                    v-model:visible={state.removeVisible}
                                    ref="popover1"
                                    placement="bottom-start"
                                    width="200"
                                    trigger="click"
                                  >
                                    {{
                                      default: () => {
                                        return (
                                          <>
                                            <p>删除以后无法恢复，是否继续?</p>
                                            <div style="text-align: right; margin: 0">
                                              <el-button
                                                size="small"
                                                text={true}
                                                disabled={state.disabledRemove}
                                                onClick={() => {
                                                  state.removeVisible = false;
                                                }}
                                              >
                                                取消
                                              </el-button>
                                              <el-button
                                                size="small" type="primary"
                                                disabled={state.disabledRemove}
                                                onClick={methods.removeUserRoles}
                                              >
                                                确认
                                              </el-button>
                                            </div>
                                          </>
                                        );
                                      },
                                      reference: () => {
                                        if (permissions.includes("remove")) {
                                          return (
                                            <el-button
                                              type="danger"
                                              icon={Delete}
                                              plain
                                              disabled={state.disabledRemove}
                                            >
                                              删除
                                            </el-button>
                                          );
                                        }
                                      }
                                    }}
                                  </el-popover>
                                </> */
                                },
                                right: () => {
                                  return (
                                    <el-input
                                      style={{ width: "240px" }}
                                      v-model={state.searchVal}
                                      clearable={true}
                                      onInput={methods.filterRole}
                                      placeholder="按权限名称搜索"
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
                                column-configs={roleTableConfig}
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
                                  delete: ({ row }: any) => {
                                    return (
                                      <el-button
                                        type="danger"
                                        plain={true}
                                        link={true}
                                        size="small"
                                        icon={Delete}
                                        disabled={!permissions.includes("pm-inner-metadata-inner-user-remove-role")}
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
