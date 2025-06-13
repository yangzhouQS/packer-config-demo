import { frameStore } from "@cs/js-inner-web-framework";
import { Close, Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { cloneDeep } from "lodash";
import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { apiPermission } from "../../../components/api-config/api-permission";
import { GlobalMessage } from "../../../components/global/global-message";
import { ModuleTypes } from "../../../components/types/module.types";
import { defaultPermissionData } from "../../../components/types/permission.types";
import { disposeFunction, errorMessage, formatDate, productEvent } from "../../../utils/utils";
import { ProductEventConfig } from "./product-config";

/**
 * 模块权限项配置
 */
export const ModulePermission = defineComponent({
  name: "ModulePermission",
  setup() {
    const disposeFn = [];
    const permissions = frameStore.$context?.permissions || [];
    const tableConfig = [
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
          prop: "name",
          label: "名称",
          headerAlign: "center",
          scopedSlot: "name",
        },
      },
      {
        attr: {
          prop: "code",
          label: "编码",
          headerAlign: "center",
        },
      },
      {
        attr: {
          prop: "description",
          label: "权限项描述",
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
    const tableLoading = ref(false);
    const formRef = ref();
    const tableData = ref([]);

    const state = reactive({
      currentModule: {} as any,
      currentProduct: {} as any,
      currentRow: {} as any,
      dialogVisible: false,
      saveLoading: false,
    });
    const validatePermission = (rule: any, value: any, callback: any) => {
      if (!value) {
        callback(new Error("填写内容不能为空"));
      }
      else {
        if (value.length > 125) {
          callback(new Error("长度不能超过125个字符"));
          return;
        }
        const params = {
          data: state.currentRow,
          field: rule.field,
        };
        apiPermission.validatePermission(params).then(({ result }: any) => {
          if (result.success) {
            callback();
          }
          else {
            callback(new Error(result.message));
          }
        }).catch((error) => {
          callback(new Error(errorMessage(error, "权限项校验失败")));
        });
      }
    };
    const roles = {
      name: [
        {
          required: true,
          // message: "请输入权限项名称",
          validator: validatePermission,
          trigger: "blur",
        },
        // {max: 40, message: '权限项名称长度不能超过50', trigger: 'blur'},
      ],
      code: [
        {
          required: true,
          // message: "请输入模块编码",
          validator: validatePermission,
          trigger: "blur",
        },
        { max: 125, message: "模块编码长度不能超过 125", trigger: "blur" },
      ],
    };
    const methods = {
      /* validatePermission: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error("填写内容不能为空"));
        }
        else {
          if (value.length > 125) {
            callback(new Error("长度不能超过125个字符"));
            return;
          }
          const params = {
            data: state.currentRow,
            field: rule.field,
          };
          apiPermission.validatePermission(params).then(({ result }: any) => {
            if (result.success) {
              callback();
            }
            else {
              callback(new Error(result.message));
            }
          }).catch((error) => {
            callback(new Error(errorMessage(error, "权限项校验失败")));
          });
        }
      }, */
      clickProduct: (product) => {
        state.currentProduct = product;
        state.currentModule = {};
      },
      clickModule: (module: ModuleTypes) => {
        state.currentModule = module;
        if (module.id) {
          methods.loadData();
        }
      },
      loadData: () => {
        apiPermission.queryPermission(state.currentModule.id).then(({ result }) => {
          tableData.value = result.permissions;
        }).catch((error) => {
          console.log(error);
        }).finally(() => {
          state.saveLoading = false;
        });
      },
      rowRemove: (row: ModuleTypes) => {
        ElMessageBox.confirm(
          `是否删除权限项：${row.name}，同时删除权限项关联授权`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            apiPermission.deletePermission(row.id).then(() => {
              GlobalMessage.success("删除成功");
              methods.loadData();
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "权限项删除失败"));
            });
          })
          .catch(() => {

          });
      },
      edit: (row) => {
        state.currentRow = cloneDeep(row);
        state.dialogVisible = true;
      },
      add: () => {
        if (!state.currentModule.id) {
          GlobalMessage.error("请先选择模块后进行添加权限项");
          return false;
        }
        state.currentRow = cloneDeep(defaultPermissionData);
        state.currentRow.moduleId = state.currentModule.id;
        state.dialogVisible = true;
      },
      /* 创建权限项 */
      createPermission: (data) => {
        apiPermission.createPermission(data).then(() => {
          GlobalMessage.success("权限项新增成功");
          methods.handleClose();
          methods.loadData();
        }).catch((error) => {
          console.log(error);
          state.saveLoading = false;
          GlobalMessage.error(errorMessage(error, "权限项新增失败"));
        });
      },
      /* 更新权限项 */
      updatePermission: (data) => {
        apiPermission.updatePermission(state.currentRow.id, data).then(() => {
          GlobalMessage.success("权限项修改成功");
          methods.handleClose();
          methods.loadData();
        }).catch((error) => {
          state.saveLoading = false;
          GlobalMessage.error(errorMessage(error, "模块修改失败"));
        });
      },
      saveForm: () => {
        state.saveLoading = true;
        formRef.value.validate((valid) => {
          if (valid) {
            if (state.currentRow.id > 0) {
              methods.updatePermission(state.currentRow);
            }
            else {
              methods.createPermission(state.currentRow);
            }
          }
          else {
            state.saveLoading = false;
            GlobalMessage.warning("表单填写校验不通过，请修改");
          }
        });
      },
      handleClose: () => {
        state.dialogVisible = false;
        state.currentRow = {};
        state.saveLoading = false;
      },
      renderPermission: () => {
        return (
          <el-dialog
            title={state.currentRow.id > 0 ? "编辑权限项" : "新增权限项"}
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
                  clearPadding: [],
                },
              ]}
            >
              {{
                "item-1": () => {
                  return (
                    <box padding-size="small" clear-padding={["bottom"]}>
                      <el-form ref={formRef} model={state.currentRow} rules={roles} label-width="120px">
                        <el-row gutter={10}>
                          <el-col span={24}>
                            <el-form-item label="权限项名称" prop="name">
                              <el-input v-model={state.currentRow.name} placeholder="权限项名称"></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col span={24}>
                            <el-form-item label="权限项编码" prop="code">
                              <el-input v-model={state.currentRow.code} placeholder="权限项编码" maxlength={125}></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col span={24}>
                            <el-form-item label="权限项描述">
                              <el-input
                                class="w-full"
                                clearable={true}
                                rows={2}
                                type="textarea"
                                v-model={state.currentRow.description}
                                placeholder="权限项描述"
                                maxlength={100}
                                show-word-limit={true}
                              >
                              </el-input>
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
        );
      },
      clearTable: () => {
        state.currentModule = {};
        tableData.value = [];
        methods.handleClose();
      },
    };

    onMounted(() => {
      disposeFn.push(productEvent.on("click-module", methods.clickModule));
      disposeFn.push(productEvent.on("click-product", methods.clickProduct));

      // 产品切换和模块点击切换时清空权限表格数据
      disposeFn.push(productEvent.on(ProductEventConfig.productModuleClick, methods.clearTable));
      disposeFn.push(productEvent.on(ProductEventConfig.productActive, methods.clearTable));
      disposeFn.push(productEvent.on(ProductEventConfig.productTreeReload, methods.clearTable));
    });

    onBeforeUnmount(() => {
      disposeFunction(disposeFn);
    });

    return () => {
      if (!state.currentModule.id) {
        return (
          <box
            padding-size="base"
            background={true}
            border={false}
            height="100%"
            clear-padding={[]}
            clear-border={[]}
            class="d-flex align-center justify-center"
          >
            <el-empty description="请选择模块后进行操作" image-size={60} />
          </box>
        );
      }
      return (
        <box
          padding-size="base"
          background={true}
          border={false}
          height="100%"
          clear-padding={[]}
          clear-border={[]}
        >
          {methods.renderPermission()}
          <panel border={true} show-header={permissions.includes("inner-meta-module-permission-add")}>
            {{
              tool: () => {
                return (
                  <flex-line left-width="100%" left-padding={true}>
                    {permissions.includes("inner-meta-module-permission-add") && (
                      <el-button
                        type="primary"
                        icon={Plus}
                        plain
                        onClick={methods.add}
                        disabled={state.currentModule.type !== "module"}
                      >
                        权限项
                      </el-button>
                    )}
                  </flex-line>
                );
              },
              default: () => {
                return (
                  <box padding-size="small">
                    <table-only
                      table-data={tableData.value}
                      table-loading={tableLoading.value}
                      column-configs={tableConfig}
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
                            <span
                              class="primary-color cursor-pointer"
                              onClick={methods.edit.bind(null, row)}
                            >
                              {row.name}
                            </span>
                          );
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
                            <>
                              <el-button
                                type="danger"
                                plain={true}
                                link={true}
                                size="small"
                                disabled={!permissions.includes("inner-meta-module-permission-remove")}
                                onClick={() => {
                                  methods.rowRemove(row);
                                }}
                              >
                                删除
                              </el-button>
                            </>
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
    };
  },
});
