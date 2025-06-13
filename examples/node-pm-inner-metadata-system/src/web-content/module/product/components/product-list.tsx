import { frameStore } from "@cs/js-inner-web-framework";
import { CirclePlus, Close, Search } from "@element-plus/icons-vue";
import { cloneDeep, filter, find, get, trim } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { apiProduct } from "../../../components/api-config/api-product";
import { GlobalMessage } from "../../../components/global/global-message";
import { IconDisabled } from "../../../components/icons";
import { SelectSetter } from "../../../components/select-setter";
import { defaultProductConfig, ProductActiveParams, ProductTypes } from "../../../components/types/product.types";
import { searchTree } from "../../../utils/funcs/search-tree";
import { toArrayTree } from "../../../utils/funcs/to-array-tree";
import { catchMessage, errorMessage, productEvent } from "../../../utils/utils";
import { ProductEventConfig } from "./product-config";

/**
 * 产品管理模块，左侧产品列表
 */
export const ProductList = defineComponent({
  name: "ProductList",
  setup() {
    const permissions = frameStore.$context?.permissions || [];
    const formRef = ref();
    let lastClickItem = null;
    const state = reactive({
      dialogVisible: false,
      productNameOrCode: "",
      searchVal: "",
      selectProductId: "",
      selectProduct: {},
      productList: [] as any[],
      products: [],
      productTree: [],
      listData: [],
      saveLoading: false,
      // 当前激活的产品
      activeProduct: {} as any,
      activeModule: {} as any,
      // 当前编辑产品
      currentRow: {
        name: "",
        code: "",
        isDisabled: false,
        icon: "",
      } as any,

    });

    const validateProduct = (rule: any, value: any, callback: (...args: any[]) => void) => {
      const txt = rule.field === "code" ? "产品编码" : "产品名称";
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

        apiProduct.validateProduct(params).then(({ result }: any) => {
          if (result.success) {
            callback();
          }
          else {
            callback(new Error(result.message));
          }
        }).catch((error) => {
          callback(new Error(errorMessage(error, "产品校验失败")));
        });
      }
    };

    const rules = {
      name: [
        {
          required: true,
          // message: "请输入产品名称",
          validator: validateProduct,
          trigger: "blur",
        },
        { max: 50, message: "产品名称长度不能超过 50", trigger: "blur" },
      ],
      code: [
        {
          required: true,
          // message: "请输入产品编码",
          validator: validateProduct,
          trigger: "blur",
        },
        { max: 50, message: "产品编码长度不能超过 50", trigger: "blur" },
      ],
      productType: [
        {
          required: true,
          message: "产品使用终端",
          trigger: "blur",
        },
      ],
    };

    const methods = {
      changeProduct: (productId: string) => {
        const product = find(state.productList, item => item.id === productId);

        // 产品切换时先清空上一个产品的模块选择
        state.activeProduct = {};
        state.activeModule = {};
        methods.setActiveProduct(product);
        methods.loadData();
      },
      saveProductForm: () => {
        formRef.value.validate((valid, fields) => {
          if (valid) {
            if (state.currentRow.id > 0) {
              methods.updateProduct();
            }
            else {
              methods.createProduct();
            }
          }
          else {
            const keys = Object.keys(fields);
            let messages = [];
            for (const key of keys) {
              const t = fields[key];
              messages.push(get(t, "0.message", ""));
            }
            messages = messages.filter(Boolean);
            GlobalMessage.warning(messages.join(", "));
            // GlobalMessage.warning("表单填写校验不通过，请修改");
          }
        });
      },
      searchProduct: () => {
        const searchVal = trim(state.searchVal).toString().toLowerCase();
        if (searchVal) {
          /* state.listData = filter(state.products, item => {
            return `${item.name}`.toLowerCase().includes(searchVal) || `${item.code}`.toLowerCase().includes(searchVal) || false
          }); */
          state.listData = searchTree(state.productTree, (item) => {
            return `${item.name}`.toLowerCase().includes(searchVal) || `${item.code}`.toLowerCase().includes(searchVal) || false;
          }, {}, {}) as any[];
        }
        else {
          state.listData = state.productTree;
        }
      },
      createProduct: () => {
        apiProduct.createProduct(state.currentRow).then(({ result }) => {
          GlobalMessage.success(`产品 ${state.currentRow.name} 创建成功`);
          methods.handleClose();
          methods.products({ productId: result.id });
        }).catch(catchMessage("产品添加失败"));
      },
      updateProduct: () => {
        apiProduct.updateProduct(state.currentRow.id, state.currentRow).then(({ result }) => {
          GlobalMessage.success(`产品修改成功`);
          methods.handleClose();
          methods.products();
          productEvent.emit(ProductEventConfig.productModuleClick, result);
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "产品修改失败"));
        });
      },
      editProduct: (product: ProductTypes) => {
        state.currentRow = cloneDeep(product);
        state.dialogVisible = true;
      },
      loadData: (activeParams?: ProductActiveParams) => {
        // 获取产品下的模块树
        apiProduct.queryProductTree(state.selectProductId).then((res) => {
          const result = filter(res.result, item => item.type !== "product");
          state.products = result;
          state.productTree = toArrayTree(result);

          if (activeParams && activeParams.moduleId) {
            state.searchVal = "";
            lastClickItem = null;
            const activeModule = find(result, item => item.id === activeParams.moduleId);
            methods.menuItem(activeModule);
          }
          methods.searchProduct();
        }).catch((error) => {
          console.log(error);
        });
      },

      /*
      * productData: 可以指定激活的产品
      * */
      products: (activeParams?: ProductActiveParams) => {
        apiProduct.queryProducts().then(({ result }) => {
          const productList = result.map((item: any) => {
            return {
              ...item,
              type: "product",
            };
          });
          state.productList = productList;

          // 已经选定的产品
          const currentProduct = find(productList, item => item.id === state.selectProductId);

          // 当前需要设置激活的产品
          const setProduct = find(productList, item => item.id === activeParams?.productId);
          if (setProduct && activeParams && activeParams.productId) {
            state.selectProductId = activeParams.productId;
            methods.setActiveProduct(setProduct);
          }
          else if (state.selectProductId && currentProduct) {
            // 如果存在已经选择的产品，无须设置
            methods.setActiveProduct(currentProduct);
          }
          else {
            const currentProduct = get(productList, "0");
            // methods.menuItem(currentProduct);
            state.selectProductId = get(productList, "0.id");

            methods.setActiveProduct(currentProduct);
          }

          methods.loadData(activeParams);
        }).catch((error) => {
          GlobalMessage.error(errorMessage(error, "产品查询失败"));
        });
      },
      setActiveProduct: (product: ProductTypes) => {
        state.activeProduct = cloneDeep(product);
        productEvent.emit(ProductEventConfig.productActive, product);
      },
      handleClose: () => {
        state.dialogVisible = false;
        state.currentRow = cloneDeep(defaultProductConfig);
      },
      menuItem: (item: ProductTypes) => {
        if (item === lastClickItem) {
          return;
        }
        lastClickItem = item;
        state.activeModule = cloneDeep(item);

        // 激活模块
        productEvent.emit(ProductEventConfig.productModuleClick, state.activeModule);
      },
      addProductRender: () => {
        return (
          <flex-box
            isRow={false}
            itemNum={2}
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
                clearPadding: [],
              },
            ]}
          >
            {{
              "item-1": () => {
                return (
                  <box padding-size="small" clear-padding={["bottom"]}>
                    <el-form
                      ref={formRef}
                      model={state.currentRow}
                      label-width="100px"
                      rules={rules}
                      label-position="right"
                    >
                      <el-row gutter={10}>
                        <el-col span={12}>
                          <el-form-item label="产品名称" prop="name">
                            <el-input v-model={state.currentRow.name} placeholder="产品名称" max={40}></el-input>
                          </el-form-item>
                        </el-col>
                        <el-col span={12}>
                          <el-form-item label="产品编码" prop="code">
                            <el-input v-model={state.currentRow.code} placeholder="产品编码" max={40}></el-input>
                          </el-form-item>
                        </el-col>
                        <el-col span={12}>
                          <el-form-item label="产品类型" prop="productType">
                            <SelectSetter
                              disabled={state.currentRow.id > 0}
                              v-model={state.currentRow.productType}
                              placeholder="请选择产品使用终端"
                              options={[
                                { label: "桌面端", value: "web" },
                                { label: "移动端", value: "mobile" },
                              ]}
                            />
                          </el-form-item>
                        </el-col>
                        <el-col span={12}>
                          <el-form-item label="产品图标" prop="icon">
                            <el-input v-model={state.currentRow.icon} placeholder="产品图标" max={125}></el-input>
                          </el-form-item>
                        </el-col>
                        <el-col span={12}>
                          <el-form-item label="排序">
                            <el-input-number class="w-full" min={0} max={9999} v-model={state.currentRow.sortCode} />
                          </el-form-item>
                        </el-col>
                        <el-col span={12}>
                          <el-form-item label="禁用">
                            <el-checkbox v-model={state.currentRow.isDisabled}>
                              {state.currentRow.isDisabled ? "禁用" : "正常"}
                            </el-checkbox>
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
                                onClick={methods.saveProductForm}
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
        );
      },
      renderLeftMenu: () => {
        if (state.listData.length === 0) {
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
              <el-empty description="暂无模块数据" image-size={60} />
            </box>
          );
        }
        return (
          <el-scrollbar class="flex-1">
            <el-menu class={["product-item-container"]} default-active={state.activeModule?.id}>
              {methods.renderRecursiveMenuItem(state.listData)}
            </el-menu>
          </el-scrollbar>
        );
      },
      renderTitle: (product) => {
        const children = [product.name];
        if (product.productType === "mobile") {
          children.push(<el-tag class="ml-1" size="small" type="success">移动</el-tag>);
        }
        if (product.isDisabled) {
          children.push(<IconDisabled class="ml-2" />);
        }
        return children;
      },
      renderRecursiveMenuItem: (menuItems: any[]) => {
        return menuItems.map((item) => {
          if (item.children && item.children.length > 0) {
            return (
              <el-sub-menu
                index={item.id}
              >
                {{
                  title: () => {
                    return (
                      <div
                        onClick={methods.menuItem.bind(null, item)}
                        class="flex-1 select-none"
                      >
                        {methods.renderTitle(item)}
                      </div>
                    );
                  },
                  default: () => {
                    return methods.renderRecursiveMenuItem(item.children);
                  },
                }}
              </el-sub-menu>
            );
          }
          return (
            <el-menu-item
              class={["product-item"]}
              onClick={methods.menuItem.bind(null, item)}
              index={item.id}
            >
              {methods.renderTitle(item)}
            </el-menu-item>
          );
        });
      },
    };

    onMounted(() => {
      methods.products();
      productEvent.on(ProductEventConfig.productReload, methods.products);
      productEvent.on(ProductEventConfig.productTreeReload, methods.loadData);
      productEvent.on(ProductEventConfig.productUpdate, methods.editProduct);
    });

    return () => {
      return (
        <box background={true} padding-size="large" height="100%" clear-padding={[]} clear-border={[]}>
          {/* 产品添加模块 */}
          <el-dialog
            title={state.currentRow.id > 0 ? "编辑产品" : "新增产品"}
            draggable={true}
            v-model={state.dialogVisible}
            width="720px"
            append-to-body={true}
            destroy-on-close={true}
            close-on-click-modal={false}
            before-close={methods.handleClose}
          >
            {state.dialogVisible && methods.addProductRender()}
          </el-dialog>

          {/* 左侧产品操作面板 */}
          <panel border={true} show-header={true}>
            {{
              tool: () => {
                return (
                  <div class="padding-small box-border overflow-hidden">
                    <div
                      style={{ width: permissions.includes("inner-meta-product-add") ? "calc(100% - 25px)" : "100%" }}
                      class="float-left"
                    >
                      <el-select
                        class="w-full"
                        v-model={state.selectProductId}
                        filterable
                        clearable
                        placeholder="请选择产品"
                        onChange={methods.changeProduct}
                      >
                        {
                          state.productList.map((item) => {
                            return (
                              <el-option value={item.id} key={item.id} label={item.name}>
                                <div class="d-flex justify-space-between align-center">
                                  {item.name}
                                  {
                                    item.isDisabled && <IconDisabled />
                                  }
                                </div>
                              </el-option>
                            );
                          })
                        }
                      </el-select>
                    </div>
                    {permissions.includes("inner-meta-product-add") && (
                      <div
                        class="float-right text-center"
                        style={{ width: "25px", height: "30px", lineHeight: "30px" }}
                        title="添加产品"
                      >
                        <el-icon
                          onClick={() => {
                            state.dialogVisible = true;
                            state.currentRow = cloneDeep(defaultProductConfig);
                          }}
                          class="cursor-pointer"
                        >
                          <CirclePlus />
                        </el-icon>
                      </div>
                    )}
                  </div>
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
                            placeholder="按名称或编码搜索"
                            suffix-icon={Search}
                            clearable={true}
                            onInput={methods.searchProduct}
                          />
                        );
                      },
                      "item-2": () => {
                        return methods.renderLeftMenu();
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
