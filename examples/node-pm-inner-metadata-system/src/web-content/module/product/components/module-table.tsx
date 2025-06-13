import { frameStore } from "@cs/js-inner-web-framework";
import { Delete, Plus, Search } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { cloneDeep, filter, find, map, trim, unset } from "lodash";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { apiModule } from "../../../components/api-config/api-module";
import { apiProduct } from "../../../components/api-config/api-product";
import { CmpCancelSave } from "../../../components/cmp-cancel-save/cmp-cancel-save";
import { GlobalMessage } from "../../../components/global/global-message";
import { SelectSetter } from "../../../components/select-setter";
import { defaultModuleData } from "../../../components/types/module.types";
import { ProductTypes } from "../../../components/types/product.types";
import { toArrayTree } from "../../../utils/funcs/to-array-tree";
import { catchMessage, disposeFunction, errorMessage, formatDate, productEvent } from "../../../utils/utils";
import { EmptyProduct } from "./empty-product";
import { ModulePermission } from "./module-permission";
import { moduleFlexConfig, ProductEventConfig } from "./product-config";
import { ProductHeaderInfo } from "./product-header-info";

/**
 * 模块表格和添加
 */
export const ModuleTable = defineComponent({
  name: "ModuleTable",
  setup() {
    const permissions = frameStore.$context?.permissions || [];
    const tableRef = ref();
    const formRef = ref();
    const tableData = ref([]);
    const disposeFns = [];

    const state = reactive({
      moduleVal: "",
      productTreeList: [] as any[],
      productTree: [] as any[],
      currentModules: [], // 当前产品对应所有模块
      // 当前点击激活的产品
      activeProduct: {} as any,

      // 当前点击激活的模块
      activeModule: {} as any,
      currentProduct: {} as any,
      currentRow: {} as any,
      tableLoading: false,
      removeVisible: false,
      dialogVisible: false,
      saveLoading: false,
      rules: {
        name: [
          {
            required: true,
            message: "请输入模块名称",
            trigger: "blur",
          },
          { max: 40, message: "模块名称长度不能超过40", trigger: "blur" },
        ],
        code: [
          {
            required: true,
            message: "请输入模块编码",
            trigger: "blur",
          },
          { max: 40, message: "模块编码长度不能超过40", trigger: "blur" },
        ],
        moduleType: [
          {
            required: true,
            message: "请选择模块类型",
            trigger: "blur",
          },
        ],
        url: [
          {
            required: true,
            message: "请填写模块地址",
            trigger: "blur",
          },
        ],
        parentId: [
          {
            required: true,
            message: "请选择上级",
            trigger: "blur",
          },
        ],
      },
    });

    const proDisabled = computed(() => {
      return !(state.activeProduct.id > 0);
    });

    const methods = {
      /* 设置当前激活德产品 */
      setActiveProduct: (product: ProductTypes) => {
        state.activeProduct = cloneDeep(product || {});
        state.activeModule = {};
        methods.loadData();
      },
      queryProductTree: () => {
        return new Promise((resolve, reject) => {
          apiProduct.queryProductTree(state.activeProduct.id).then(({ result }) => {
            // 创建时存储上级模块数据
            /* if (state.currentRow.parentId > 0) {
              state.currentRow.parentData = find(result, (item) => item.id === state.currentRow.parentId);
            } */
            state.productTreeList = cloneDeep(result);

            state.productTree = toArrayTree(map(result, (item) => {
              return Object.assign(item, { disabled: item.type === "module" });
            }));

            resolve(state.productTree);
          }).catch((error) => {
            GlobalMessage.error(errorMessage(error, "产品查询失败"));
            reject(error);
          });
        });
      },
      /* 添加模块 */
      add: async () => {
        if (!state.activeProduct.id) {
          GlobalMessage.info("请先选择左侧产品");
          return false;
        }
        state.currentRow = cloneDeep(defaultModuleData);
        state.currentRow.productId = state.activeProduct.id;
        state.currentRow.parentId = state.activeProduct.id;

        if (state.activeModule.type === "group") {
          state.currentRow.parentId = state.activeModule.id;
        }

        await methods.queryProductTree();

        state.dialogVisible = true;
      },
      /* 单个模块编辑 */
      edit: async (row) => {
        state.currentRow = cloneDeep(row);

        await methods.queryProductTree();
        state.dialogVisible = true;
      },
      handleRowChange: (row) => {
        if (row && row.id) {
          productEvent.emit("click-module", row);
        }
      },
      /* 单个模块删除 */
      rowRemove: (row) => {
        ElMessageBox.confirm(
          `是否删除模块：${row.name}，同时删除模块相关权限项`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            apiModule.deleteModule(row.id).then(() => {
              GlobalMessage.success("删除成功");
              methods.loadData(true);
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "模块删除失败"));
            });
          })
          .catch(() => {

          });
      },
      /* 根据产品id加载下属模块 */
      loadData: (isReload = false) => {
        const activeModule = cloneDeep(state.activeModule);
        unset(activeModule, "children");

        if (!state.activeProduct.id) {
          return;
        }

        const params = {
          product: state.activeProduct,
          module: activeModule,
        };

        apiProduct.findProductChild(params).then(({ result }) => {
          const { product, modules } = result;
          if (state.activeProduct.id === product.id) {
            state.currentModules = modules;
            methods.filterModule();
          }

          if (isReload) {
            productEvent.emit(ProductEventConfig.productTreeReload);
          }
        }).catch(catchMessage("模块查询失败"));
      },
      /* 模块过滤搜索 */
      filterModule: () => {
        const txt = trim(state.moduleVal).toLowerCase();
        if (txt) {
          tableData.value = filter(cloneDeep(state.currentModules), (item) => {
            return `${item.code}`.toLowerCase().includes(txt) || `${item.name}`.toLowerCase().includes(txt) || false;
          });
        }
        else {
          tableData.value = state.currentModules;
        }
      },
      /* 点击左侧产品 */
      clickProductModule: (item) => {
        state.activeModule = item || {};
        methods.loadData();
      },
      /* 创建模块 */
      createModule: (moduleData: any) => {
        apiModule.createModule(moduleData).then(({ result }) => {
          GlobalMessage.success("模块新增成功");
          methods.handleClose();
          methods.loadData();
          // 添加完成模块刷新左侧产品模块
          productEvent.emit(ProductEventConfig.productReload, { moduleId: result.id });
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "模块添加失败"));
        });
      },
      /* 更新模块 */
      updateModule: (moduleData) => {
        unset(moduleData, "parentData");
        apiModule.updateModule(state.currentRow.id, moduleData).then(() => {
          GlobalMessage.success("模块修改成功");

          // 修改完成刷新左侧产品模块
          productEvent.emit(ProductEventConfig.productReload, { moduleId: state.currentRow.id });
          methods.handleClose();
          // methods.loadData();
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "模块修改失败"));
        });
      },
      /* 模块数据校验 */
      saveModuleForm: () => {
        formRef.value.validate((valid, fields) => {
          if (valid) {
            if (state.currentRow.id > 0) {
              methods.updateModule(state.currentRow);
            }
            else {
              methods.createModule(state.currentRow);
            }
          }
          else {
            console.log("error submit!", fields);
          }
        });
      },
      handleClose: () => {
        state.currentRow = cloneDeep(defaultModuleData);
        state.dialogVisible = false;
      },
      renderModule: () => {
        if (!state.dialogVisible) {
          return null;
        }
        return (
          <el-dialog
            title={state.currentRow.id > 0 ? "编辑模块" : "新增模块"}
            draggable={true}
            v-model={state.dialogVisible}
            width="720px"
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
                      <el-form ref={formRef} model={state.currentRow} rules={state.rules} label-width="80px">
                        <el-row gutter={10}>
                          <el-col span={12}>
                            <el-form-item label="类型">
                              <el-radio-group
                                disabled={state.currentRow.id > 0}
                                v-model={state.currentRow.type}
                              >
                                <el-radio-button label="模块" value="module" />
                                <el-radio-button label="分组" value="group" />
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col span={12}>
                            <el-form-item label="上级" prop="parentId">
                              <el-tree-select
                                v-model={state.currentRow.parentId}
                                data={state.productTree}
                                clearable={true}
                                filterable={true}
                                default-expand-all={true}
                                popper-class="product-popper-container"
                                props={{
                                  label: "name",
                                  children: "children",
                                  disabled: "disabled",
                                }}
                                onChange={(id) => {
                                  if (id) {
                                    state.currentRow.parentData = find(
                                      state.productTreeList,
                                      item => item.id === id,
                                    );
                                  }
                                }}
                              >
                                {{
                                  header: () => {
                                    return <div>请选产品或者分组</div>;
                                  },
                                  default: ({ data }) => {
                                    return (
                                      <el-option value={data.id} label={data.name} disabled={data.disabled}>

                                      </el-option>
                                    );
                                  },
                                }}
                              </el-tree-select>
                            </el-form-item>
                          </el-col>
                          <el-col span={12}>
                            <el-form-item label="名称" prop="name">
                              <el-input v-model={state.currentRow.name} placeholder="名称" maxlength={40}></el-input>
                            </el-form-item>
                          </el-col>
                          <el-col span={12}>
                            <el-form-item label="编码" prop="code">
                              <el-input v-model={state.currentRow.code} placeholder="编码" maxlength={40}></el-input>
                            </el-form-item>
                          </el-col>
                          {state.currentRow.type === "module" && (
                            <>
                              <el-col span={12}>
                                <el-form-item label="模块类型" prop="moduleType">
                                  <SelectSetter
                                    v-model={state.currentRow.moduleType}
                                    placeholder="请选择模块类型"
                                    options={[
                                      { label: "一般页面", value: "internal" },
                                      { label: "外部页面", value: "url" },
                                    ]}
                                  />
                                </el-form-item>
                              </el-col>
                              <el-col span={12}>
                                <el-form-item label="模块图标" prop="icon">
                                  <el-input
                                    clearable={true}
                                    v-model={state.currentRow.icon}
                                    placeholder="模块图标"
                                    maxlength={125}
                                  >
                                  </el-input>
                                </el-form-item>
                              </el-col>
                              <el-col span={24}>
                                <el-form-item label="模块地址" prop="url">
                                  <el-input
                                    clearable={true}
                                    v-model={state.currentRow.url}
                                    placeholder="模块地址"
                                    maxlength={125}
                                  >
                                  </el-input>
                                </el-form-item>
                              </el-col>
                              <el-col span={24}>
                                <el-form-item label="状态">
                                  <el-row gutter="10" class="w-full">
                                    <el-col span={8}>
                                      <el-checkbox v-model={state.currentRow.isDisabled} label="禁用" />
                                    </el-col>
                                    <el-col span={8}>
                                      <el-checkbox v-model={state.currentRow.isVisible}>
                                        {state.currentRow.isVisible ? "显示" : "隐藏"}
                                      </el-checkbox>
                                    </el-col>
                                    <el-col span={8}>
                                      <el-checkbox v-model={state.currentRow.isDefault} label="默认入口" />
                                    </el-col>
                                  </el-row>
                                </el-form-item>
                              </el-col>
                            </>
                          )}
                          <el-col span={12}>
                            <el-form-item label="排序">
                              <el-input-number min={0} max={9999} v-model={state.currentRow.sortCode} />
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </el-form>
                    </box>
                  );
                },
                "item-2": () => {
                  return (
                    <CmpCancelSave
                      onCancel={methods.handleClose}
                      onSave={methods.saveModuleForm}
                      saveDisabled={state.saveLoading}
                    />
                  );
                },
              }}
            </flex-box>
          </el-dialog>
        );
      },
    };
    onMounted(() => {
      disposeFns.push(productEvent.on(ProductEventConfig.productModuleClick, methods.clickProductModule));

      /* 设置当前激活产品 */
      disposeFns.push(productEvent.on(ProductEventConfig.productActive, methods.setActiveProduct));
    });

    onBeforeUnmount(() => {
      disposeFunction(disposeFns);
    });

    return () => {
      if (!state.activeProduct.id) {
        return <EmptyProduct />;
      }

      return (
        <>
          {methods.renderModule()}
          <flex-box
            isRow={false}
            itemNum={3}
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
                clearPadding: ["left", "top", "bottom", "right"],
              },
              {
                tag: "item-3",
                isFixed: true,
                showDragButton: true,
                dragButtonPosition: "top",
                size: "260px",
                paddingSize: "large",
                clearPadding: ["left", "right", "bottom"],
              },
            ]}
          >
            {{
              "item-1": () => {
                return <ProductHeaderInfo activeProduct={state.activeProduct} />;
              },
              "item-2": () => {
                return (
                  <box
                    padding-size="base"
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
                            <flex-line left-padding={true} right-padding={true}>
                              {{
                                default: () => {
                                  return permissions.includes("inner-meta-module-add") && (
                                    <el-button
                                      type="primary"
                                      icon={Plus}
                                      onClick={methods.add}
                                      disabled={proDisabled.value}
                                    >
                                      模块
                                    </el-button>
                                  );
                                },
                                right: () => {
                                  return (
                                    <el-input
                                      style={{ width: "240px" }}
                                      v-model={state.moduleVal}
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
                                ref={tableRef}
                                table-data={tableData.value}
                                table-loading={state.tableLoading}
                                column-configs={moduleFlexConfig}
                                onCurrentChange={methods.handleRowChange}
                              >
                                {{
                                  createdAt: ({ row }: any) => {
                                    return row.createdAt && formatDate(row.createdAt);
                                  },
                                  modifierAt: ({ row }: any) => {
                                    return row.modifierAt && formatDate(row.modifierAt);
                                  },
                                  name: ({ row }: any) => {
                                    return (
                                      <el-button
                                        onClick={methods.edit.bind(null, row)}
                                        type="primary"
                                        size="small"
                                        plain
                                        text={true}
                                        disabled={!permissions.includes("inner-meta-module-edit")}
                                      >
                                        {row.name}
                                      </el-button>
                                    );
                                  },
                                  moduleType: ({ row }: any) => {
                                    return row.moduleType === "internal" ? "一般页面" : "外部链接";
                                  },
                                  type: ({ row }: any) => {
                                    return row.type === "group"
                                      ? <el-tag type="info">分组</el-tag>
                                      : <el-tag type="primary">模块</el-tag>;
                                  },
                                  isDisabled: ({ row }: any) => {
                                    if (!row.isDisabled) {
                                      return (
                                        <el-tag type="success" size="small">
                                          正常
                                        </el-tag>
                                      );
                                    }
                                    else {
                                      return (
                                        <el-tag type="danger" size="small">
                                          禁用
                                        </el-tag>
                                      );
                                    }
                                  },
                                  designPC: ({ row }: any) => {
                                    return (
                                      <el-button
                                        type="danger"
                                        plain={true}
                                        link={true}
                                        size="small"
                                        icon={Delete}
                                        disabled={!permissions.includes("inner-meta-module-remove")}
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
              "item-3": () => {
                return <ModulePermission />;
              },
            }}
          </flex-box>
        </>
      );
    };
  },
});
