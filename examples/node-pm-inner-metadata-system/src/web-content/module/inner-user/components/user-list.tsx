import { $http, frameStore } from "@cs/js-inner-web-framework";

import { CirclePlus, Close, Iphone, Search, User } from "@element-plus/icons-vue";
import { debounce, trim, unset } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { apiUser } from "../../../components/api-config/api-user";
import { GlobalMessage } from "../../../components/global/global-message";
import { errorMessage, userEvent } from "../../../utils/utils";
import UserDialog from "./user-dialog.vue";

/**
 * 用户管理模块，左侧用户列表
 */
export const UserList = defineComponent({
  name: "UserList",
  setup() {
    const permissions = frameStore.$context?.permissions || [];
    const formRef = ref();
    const addState = ref("mctech");
    const listNextRef = ref();
    const lastUser = ref<any>({});
    const state = reactive({
      dialogVisible: false,
      listLoading: false,
      searchVal: "",
      listData: [],
      userData: [],
      saveLoading: false,
      saveDisabled: true,
      actionType: "",
      pageNum: 1,
      currentRow: {
        name: "",
        code: "",
        isDisabled: false,
        icon: "",
      } as any,
      rules: {
        phoneNumber: [
          {
            required: true,
            message: "请输入正确手机号",
            trigger: "blur",
          },
        ],
      },
    });
    const methods = {
      saveForm: () => {
        // 添加时分配权限
        if (state.actionType === "add") {
          methods.menuItem(state.currentRow);
          state.dialogVisible = false;
          userEvent.emit("user-relation-role", state.currentRow);
        }
      },
      search: debounce((searchVal = "") => {
        state.searchVal = searchVal;
        methods.loadData(true);
      }, 250),
      queryPhoneUser: () => {
        const phoneNumber = trim(state.currentRow.phoneNumber);
        if (!phoneNumber || phoneNumber.length !== 11) {
          GlobalMessage.warning(`手机号格式不正确`);
          return false;
        }
        apiUser.queryPhoneUser(state.currentRow.phoneNumber).then(({ result }) => {
          if (result.success) {
            state.currentRow = result.user;
            methods.menuItem(result.user);
            state.saveDisabled = false;
            GlobalMessage.success(result.message);
          }
          else { // 用户已经存在
            GlobalMessage.warning(result.message);
          }

          state.searchVal = result.user.phoneNumber;
          methods.search();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "手机号在系统内不存在"));
        });
      },
      loadData: (isReset = false) => {
        const params = listNextRef.value.getPaginationParams(isReset/* , state.pageNum */);

        if (state.searchVal) {
          Object.assign(params, {
            phoneNumber: `%${trim(state.searchVal)}%`,
          });
        }
        else {
          unset(params, "phoneNumber");
        }

        apiUser.queryOperatorList(params).then(({ result }) => {
          state.userData = result;
          state.listData = result;
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "角色列表查询失败"));
          console.log(error);
        });
      },
      handleClose: () => {
        state.dialogVisible = false;
        state.currentRow = {};
      },
      saveClose: () => {
        state.dialogVisible = false;
        state.currentRow = {};
        methods.loadData(true);
      },
      menuItem: (item: any) => {
        if (lastUser && lastUser.value.id === item.id) {
          return;
        }
        lastUser.value = item;
        userEvent.emit("click-user", item);
      },
    };
    onMounted(async () => {
      methods.loadData();
      userEvent.on("reload-user", methods.loadData);
      const commonRes = await $http.get(`user/get-plat-form-manu-facturer`);
      if (commonRes && commonRes.status === "success") {
        addState.value = commonRes.result;
      }
    });
    return () => {
      return (
        <box background={true} padding-size="large" height="100%" clear-padding={[]} clear-border={[]}>
          {/* 角色添加换个角色编辑面板 */}
          <el-dialog
            title="新增内部用户"
            draggable={true}
            v-model={state.dialogVisible}
            width="450px"
            append-to-body={true}
            destroy-on-close={true}
            close-on-click-modal={false}
            before-close={methods.handleClose}
          >
            {
              addState.value === "mctech"
                ? (
                    <UserDialog onClose={(value) => {
                      if (value.isClose) {
                        state.dialogVisible = false;
                        state.currentRow = {};
                      }
                      state.searchVal = value.result.phoneNumber;
                      methods.loadData(true);
                    }}
                    >
                    </UserDialog>
                  )
                : (
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
                              <el-form ref={formRef} model={state.currentRow} rules={state.rules} label-width="100px">
                                <el-row gutter={10}>
                                  <el-col span={24} class="mb-4">
                                    <el-alert title="添加用户必须已经添加在SaaS系统" type="success" />
                                  </el-col>
                                  <el-col span={24}>
                                    <el-form-item label="手机号" prop="phoneNumber">
                                      <el-input
                                        v-model={state.currentRow.phoneNumber}
                                        placeholder="用户手机号"
                                        onChange={methods.queryPhoneUser}
                                      >
                                        {{
                                          append: () => {
                                            return (
                                              <el-icon
                                                onClick={methods.queryPhoneUser}
                                                class="cursor-pointer"
                                              >
                                                <Search />
                                              </el-icon>
                                            );
                                          },
                                        }}
                                      </el-input>
                                    </el-form-item>
                                  </el-col>
                                  <el-col span={24}>
                                    <el-form-item label="用户姓名">
                                      <el-input v-model={state.currentRow.name} placeholder="用户姓名" disabled={true}></el-input>
                                    </el-form-item>
                                  </el-col>
                                  <el-col span={24}>
                                    <el-form-item label="登录账号">
                                      <el-input
                                        v-model={state.currentRow.loginId}
                                        placeholder="用户登录账号"
                                        disabled={true}
                                      />
                                    </el-form-item>
                                  </el-col>
                                  <el-col span={24}>
                                    <el-form-item label="用户描述">
                                      <el-input v-model={state.currentRow.remark} placeholder="描述" disabled={true}></el-input>
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
                                          disabled={state.saveDisabled}
                                          loading={state.saveLoading}
                                        >
                                          <i class="cs-common baocun el-icon--left"></i>
                                          分配权限
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
                  )
            }
          </el-dialog>

          {/* 左侧用户操作面板 */}
          <panel border={true} show-header={true}>
            {{
              tool: () => {
                return (
                  <flex-line left-padding={true} right-padding={true}>
                    {{
                      default: () => {
                        return <span>内部用户</span>;
                      },
                      right: () => {
                        if (!permissions.includes("pm-inner-metadata-inner-user-add")) {
                          return null;
                        }
                        return (
                          <span class="d-flex px-2 align-center">
                            <el-tooltip
                              effect="light"
                              content="添加用户"
                              placement="right"
                            >
                              <el-icon
                                onClick={() => {
                                  state.dialogVisible = true;
                                  state.actionType = "add";
                                  state.currentRow = {};
                                }}
                                class="cursor-pointer"
                              >
                                <CirclePlus />
                              </el-icon>
                            </el-tooltip>
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
                            placeholder="手机号或用户名称搜索"
                            clearable
                            suffix-icon={Search}
                            onChange={(val) => {
                              if (!val) {
                                state.searchVal = "";
                              }
                            }}
                            onInput={(val) => {
                              methods.search(val);
                            }}
                          >
                          </el-input>
                        );
                      },
                      "item-2": () => {
                        return (
                          <list-next
                            ref={listNextRef}
                            direction="vertical"
                            loading={state.listLoading}
                            list-data={state.listData}
                            fill={true}
                            space-style={{ width: "100%" }}
                            wrap={true}
                            pagination={{
                              currentSize: 10,
                              pageSizes: [5, 10, 20, 30, 50, 150],
                              layout: "sizes, prev, pager, next, total",
                            }}
                            list-item-props={{
                              width: "100%",
                              border: true,
                              paddingSize: "small",
                            }}
                            onReload={methods.loadData}
                          >
                            {{
                              item: ({ row }) => {
                                const item = row;
                                return (
                                  <box
                                    padding-size="small"
                                    class={[
                                      "sys-user-list-item",
                                      "cursor-pointer",
                                      { "user-active": item.id === lastUser.value.id },
                                    ]}
                                    onClick={methods.menuItem.bind(null, item)}
                                  >
                                    <div class="text-truncate user-title">
                                      <el-icon><User /></el-icon>
                              &nbsp;
                                      {item.name}
                                    </div>
                                    <div class="text-truncate">
                                      <el-icon><Iphone /></el-icon>
                              &nbsp;
                                      {item.phoneNumber}
                                    </div>
                                  </box>
                                );
                              },
                            }}
                          </list-next>
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
