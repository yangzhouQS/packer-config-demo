import { frameStore } from "@cs/js-inner-web-framework";
import { CirclePlus, Close, Search } from "@element-plus/icons-vue";
import { cloneDeep, filter, find, get, trim } from "lodash";

import { defineComponent, onMounted, reactive, ref } from "vue";
import { apiRole } from "../../../components/api-config/api-role";
import { GlobalMessage } from "../../../components/global/global-message";
import { IconDisabled } from "../../../components/icons";
import { defaultRoleData, RoleActiveParams, RoleTypes } from "../../../components/types/role.types";
import { catchMessage, errorMessage, roleEvent } from "../../../utils/utils";
import { RoleEventConfig } from "./role-config";

/**
 * 角色管理模块，左侧角色列表
 */
export const RoleList = defineComponent({
  name: "RoleList",
  setup() {
    const permissions = frameStore.$context?.permissions || [];
    const formRef = ref();
    const state = reactive({
      dialogVisible: false,
      searchVal: "",
      listData: [],
      roleData: [],
      saveLoading: false,
      activeMenu: {} as any,
      currentRow: {
        name: "",
        description: "",
        isDisabled: false,
      } as any,
    });
    const methods = {
      edit: (roleItem: RoleTypes) => {
        if (!roleItem) {
          GlobalMessage.warning("编辑角色参数不完整");
          return;
        }
        state.currentRow = cloneDeep(roleItem);
        state.dialogVisible = true;
      },
      saveForm: () => {
        formRef.value.validate((valid, fields) => {
          if (valid) {
            if (state.currentRow.id > 0) {
              methods.updateRole();
            }
            else {
              methods.createRole();
            }
          }
          else {
            console.log("error submit!", fields);
          }
        });
      },
      search: () => {
        const searchVal = trim(state.searchVal);
        if (searchVal) {
          state.listData = filter(state.roleData, (item) => {
            return `${item.name}`.toLowerCase().includes(searchVal.toString().toLowerCase());
          });
        }
        else {
          state.listData = state.roleData;
        }
      },
      createRole: () => {
        apiRole.createRole(state.currentRow).then(({ result }) => {
          GlobalMessage.success(`角色 ${state.currentRow.name} 创建成功`);
          methods.handleClose();
          methods.loadData({ roleId: result.id });
        }).catch(catchMessage("角色添加失败"));
      },
      updateRole: () => {
        apiRole.updateRole(state.currentRow.id, state.currentRow).then(({ result }) => {
          GlobalMessage.success(`角色: ${state.currentRow.name} 更新成功`);
          methods.handleClose();
          methods.loadData({ roleId: result.id });
          methods.menuItem(result);
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "角色更新失败"));
        });
      },
      checkRoleName: (rule: any, value: any, callback: any) => {
        const txt = "角色名称";
        if (!value) {
          callback(new Error(`${txt}不能为空`));
        }
        else {
          if (value.length > 50) {
            callback(new Error("长度不能超过50个字符"));
            return;
          }
          const params = {
            data: state.currentRow,
            field: rule.field,
          };
          apiRole.validateRole(params).then(({ result }) => {
            if (result.success) {
              callback();
            }
            else {
              callback(new Error(result.message));
            }
          }).catch((error) => {
            callback(new Error(errorMessage(error, "角色名称重复校验失败")));
          });
        }
      },
      loadData: (activeRole?: RoleActiveParams) => {
        apiRole.queryRoles().then(({ result }) => {
          if (activeRole && activeRole.roleId) {
            const role = find(result, role => role.id === activeRole.roleId);
            if (role) {
              state.searchVal = "";
              methods.menuItem(role);
            }
          }
          else {
            const firstRole = get(result, "[0]", {});
            state.activeMenu = firstRole;
            methods.menuItem(firstRole);
          }
          state.roleData = result;
          methods.search();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "角色列表查询失败"));
          console.log(error);
        });
      },
      handleClose: () => {
        state.dialogVisible = false;
        state.currentRow = cloneDeep(defaultRoleData);
      },
      menuItem: (item) => {
        state.activeMenu = item || {};
        roleEvent.emit("click-role", item);
      },
    };
    const rules = {
      name: [
        {
          required: true,
          // message: "请输入角色名称",
          validator: methods.checkRoleName,
          trigger: "blur",
        },
        { max: 40, message: "角色名称长度不能超过64", trigger: "blur" },
      ],
      description: [
        { max: 125, message: "描述长度不能超过125", trigger: "blur" },
      ],
    };
    onMounted(() => {
      methods.loadData();
      roleEvent.on("role-edit", methods.edit);
      roleEvent.on(RoleEventConfig.roleReload, methods.loadData);
    });
    return () => {
      return (
        <box background={true} padding-size="large" height="100%" clear-padding={[]} clear-border={[]}>
          {/* 角色添加换个角色编辑面板 */}
          <el-dialog
            title={state.currentRow.id > 0 ? "编辑角色" : "新增角色"}
            draggable={true}
            v-model={state.dialogVisible}
            width="450px"
            append-to-body={true}
            destroy-on-close={true}
            close-on-click-modal={false}
            before-close={methods.handleClose}
          >
            <flex-box
              isRow={false}
              itemNum={2}
              itemConfig={[
                {
                  tag: "item-1",
                  isFixed: false,
                  size: "",
                  paddingSize: "large",
                  clearPadding: [],
                },
                {
                  tag: "item-2",
                  isFixed: true,
                  size: "",
                  paddingSize: "large",
                  clearPadding: ["top"],
                },
              ]}
            >
              {{
                "item-1": () => {
                  return (
                    <box padding-size="small" clear-padding={["bottom"]}>
                      <el-form ref={formRef} model={state.currentRow} rules={rules} label-width="100px">
                        <el-row gutter={10}>
                          <el-col span={24}>
                            <el-form-item label="角色名称" prop="name">
                              <el-input
                                v-model={state.currentRow.name}
                                placeholder="角色名称"
                                max={40}
                              />
                            </el-form-item>
                          </el-col>
                          <el-col span={24}>
                            <el-form-item label="描述">
                              <el-input
                                show-word-limit={true}
                                maxlength={50}
                                type="textarea"
                                v-model={state.currentRow.description}
                                placeholder="描述"
                                max={50}
                              />
                            </el-form-item>
                          </el-col>
                          <el-col span={24}>
                            <el-form-item label="禁用">
                              <el-switch v-model={state.currentRow.isDisabled} />
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </el-form>
                    </box>
                  );
                },
                "item-2": () => {
                  return (
                    <box padding-size="small">
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
                                  保存
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
          </el-dialog>

          {/* 左侧角色操作面板 */}
          <panel border={true} show-header={true}>
            {{
              tool: () => {
                return (
                  <flex-line left-padding={true} right-padding={true}>
                    {{
                      default: () => {
                        return <span>角色管理</span>;
                      },
                      right: () => {
                        if (!permissions.includes("pm-inner-metadata-role-permission-add")) {
                          return null;
                        }
                        return (
                          <span class="d-flex px-2 align-center">
                            <el-icon
                              onClick={() => {
                                state.dialogVisible = true;
                                state.currentRow = cloneDeep(defaultRoleData);
                              }}
                              class="cursor-pointer"
                              title="添加角色"
                            >
                              <CirclePlus />
                            </el-icon>
                          </span>
                        );
                      },
                    }}
                  </flex-line>
                );
              },
              default: () => {
                return (
                  <flex-box
                    isRow={false}
                    itemNum={2}
                    itemConfig={[
                      {
                        tag: "item-1",
                        isFixed: true,
                        size: "",
                        paddingSize: "base",
                        clearPadding: ["bottom"],
                      },
                      {
                        tag: "item-2",
                        isFixed: false,
                        size: "",
                        paddingSize: "base",
                        clearPadding: [],
                      },
                    ]}
                  >
                    {{
                      "item-1": () => {
                        return (
                          <el-input
                            class="flex-1"
                            v-model={state.searchVal}
                            placeholder="按角色名称搜索"
                            suffix-icon={Search}
                            onInput={methods.search}
                          />
                        );
                      },
                      "item-2": () => {
                        return (
                          <el-scrollbar class="flex-1">
                            <el-menu class={["product-item-container"]} default-active={state.activeMenu?.id}>
                              {state.listData.map((item) => {
                                return (
                                  <el-menu-item
                                    index={item.id}
                                    class={["product-item"]}
                                    onClick={methods.menuItem.bind(null, item)}
                                  >
                                    <div class="d-flex align-center">
                                      {item.name}
                                      {item.isDisabled && <span class="d-flex align-center ml-2"><IconDisabled /></span>}
                                    </div>
                                  </el-menu-item>
                                );
                              })}
                            </el-menu>
                          </el-scrollbar>
                        );
                      },
                    }}
                  </flex-box>
                );
              },
            }}
          </panel>
        </box>
      );
    };
  },
});
