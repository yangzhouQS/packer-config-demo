import { frameStore } from "@cs/js-inner-web-framework";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { computed, defineComponent } from "vue";
import { apiProduct } from "../../../components/api-config/api-product";
import { EmptyDanger } from "../../../components/empty-danger/empty-danger";
import { GlobalMessage } from "../../../components/global/global-message";
import { IconDisabled, IconFolder } from "../../../components/icons";
import { errorMessage, getUrlParameters, productEvent } from "../../../utils/utils";
import { ProductEventConfig } from "./product-config";

export const ProductHeaderInfo = defineComponent({
  name: "ProductHeaderInfo",
  props: {
    activeProduct: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const queryParams = getUrlParameters();
    const permissions = frameStore.$context?.permissions || [];
    const disabledProduct = computed(() => {
      if (queryParams && queryParams.productId === props.activeProduct.id) {
        return true;
      }
      return props.activeProduct.type !== "product";
    });
    const methods = {
      removeProduct: () => {
        if (!props.activeProduct.id) {
          GlobalMessage.warning("当前删除产品参数不完整");
          return false;
        }
        ElMessageBox.confirm(
          `是否删除产品：${props.activeProduct.name}`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            apiProduct.removeProduct(props.activeProduct.id).then(({ result }: any) => {
              if (result.success) {
                GlobalMessage.success("产品删除成功");
                productEvent.emit(ProductEventConfig.productReload);
              }
              else {
                const message = result.modules.map(item => item.name);
                GlobalMessage.warning(`[${props.activeProduct.name}]产品下存在模块：${message}，请先删除模块后再删除产品`);
              }
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "产品删除失败"));
            });
          })
          .catch(() => {
          });
      },
      editProduct: () => {
        productEvent.emit(ProductEventConfig.productUpdate, props.activeProduct);
      },
    };

    return () => {
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
                      <IconFolder class="mr-2" />
                    </span>
                    {
                      props.activeProduct.id > 0 && (
                        <>
                          <span>{props.activeProduct.name}</span>
                          <span>
                              &nbsp;&nbsp;(编码：
                            {props.activeProduct.code}
                            )
                          </span>
                        </>
                      )
                    }
                    {
                      props.activeProduct.isDisabled && <IconDisabled class="ml-2" />
                    }
                  </div>
                );
              },
              right: () => {
                return (
                  <div>
                    {permissions.includes("inner-meta-product-edit") && (
                      <el-button
                        type="primary"
                        icon={Edit}
                        plain
                        onClick={methods.editProduct.bind(null, {})}
                        disabled={props.activeProduct.type !== "product"}
                      >
                        产品
                      </el-button>
                    )}

                    <EmptyDanger />
                    {permissions.includes("inner-meta-product-remove") && (
                      <el-button
                        type="danger"
                        icon={Delete}
                        plain
                        disabled={disabledProduct.value}
                        onClick={methods.removeProduct}
                      >
                        产品
                      </el-button>
                    )}
                  </div>
                );
              },
            }}
          </flex-line>
        </box>
      );
    };
  },
});
