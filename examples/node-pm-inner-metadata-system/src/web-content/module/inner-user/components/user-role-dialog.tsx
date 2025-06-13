import { Search } from "@element-plus/icons-vue";
import { filter, find, trim } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { apiRole } from "../../../components/api-config/api-role";
import { CmpCancelSave } from "../../../components/cmp-cancel-save/cmp-cancel-save";
import { GlobalMessage } from "../../../components/global/global-message";
import { errorMessage, userEvent } from "../../../utils/utils";

export const UserRoleDialog = defineComponent({
  name: "UserRoleDialog",
  props: {
    // 当前点击操作的用户
    currentUser: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 当前用户所拥有的角色
    currentRoles: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const tableRef = ref();
    const tableOnlyRef = ref();
    const tableData = ref([]);
    const tableConfig = [
      {
        attr: {
          label: "序号",
          type: "selection",
          width: 100,
          align: "center",
          selectable: (row: any) => {
            const item = find(props.currentRoles, (item: any) => item.roleId === row.id) as any;
            return item === undefined;
          },
        },
      },
      { attr: { prop: "name", label: "权限名称" } },
      { attr: { prop: "description", label: "权限描述" } },
    ];

    const state = reactive({
      searchVal: "",
      saveLoading: false,
      tableLoading: false,
      roles: [],
      listData: [],
      filterVal: "",
    });

    const methods = {
      handleClose: (isReload = false) => {
        userEvent.emit("close-user-role-dialog", isReload);
      },
      saveForm: () => {
        const rows = tableRef.value!.getSelectionRows();
        if (rows.length > 0) {
          methods.userRelationRole(rows);
        }
        else {
          GlobalMessage.info("请选择要分配的权限");
        }
      },
      handleSelectChange: () => {
      },
      userRelationRole: (selectRows) => {
        const params = {
          userId: props.currentUser.id,
          roles: selectRows.map((item) => {
            return {
              id: item.id,
            };
          }),
        };
        state.saveLoading = true;
        apiRole.userRelationRole(params).then(() => {
          GlobalMessage.success("用户分配角色成功");
          methods.handleClose(true);
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "用户分配角色操作失败"));
        }).finally(() => {
          state.saveLoading = false;
        });
      },
      loadData: () => {
        apiRole.queryRoles().then(({ result }) => {
          state.roles = result;
          methods.searchVal();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "产品查询失败"));
        });
      },
      searchVal: () => {
        const searchVal = trim(state.filterVal).toString().toLowerCase();

        if (searchVal) {
          tableData.value = filter(state.roles, (item) => {
            return `${item.name}`.toLowerCase().includes(searchVal);
          });
        }
        else {
          tableData.value = state.roles;
        }
      },
      checkMethod: ({ row }) => {
        // console.log('props.currentRoles', props.currentRoles, row);
        const isValid = find(props.currentRoles, (item: any) => item.id === row.id);
        return !isValid;
      },
      toggleRowSelection: (row) => {
        const isValid = find(props.currentRoles, (item: any) => item.roleId === row.id);
        // 未选择的才可以切换
        if (!isValid) {
          tableRef.value!.toggleRowSelection(row, undefined);
        }
      },
    };

    onMounted(() => {
      tableRef.value = tableOnlyRef.value.getNativeRefs();
      methods.loadData();
    });

    return () => {
      return (
        <flex-box
          isRow={false}
          itemNum={2}
          height="70vh"
          itemConfig={[
            {
              tag: "item-1",
              isFixed: false,
              size: "",
              paddingSize: "large",
              clearPadding: ["bottom"],
            },
            {
              tag: "item-2",
              isFixed: true,
              size: "",
              paddingSize: "large",
              clearPadding: ["right"],
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
                                  style={{ width: "240px" }}
                                  v-model={state.filterVal}
                                  placeholder="权限名称搜索"
                                  onInput={methods.searchVal}
                                  clearable
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
                        <table-only
                          ref={tableOnlyRef}
                          table-data={tableData.value}
                          table-loading={state.tableLoading}
                          column-configs={tableConfig}
                          onSelectionChange={methods.handleSelectChange}
                          onRowClick={(row) => {
                            methods.toggleRowSelection(row);
                          }}
                        />
                      );
                    },
                  }}
                </panel>
              );
            },
            "item-2": () => {
              return (
                <CmpCancelSave
                  save-loading={state.saveLoading}
                  onSave={methods.saveForm}
                  onCancel={methods.handleClose}
                />
              );
            },
          }}
        </flex-box>
      );
    };
  },
});
