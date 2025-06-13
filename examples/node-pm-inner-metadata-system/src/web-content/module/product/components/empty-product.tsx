import { defineComponent } from "vue";

export const EmptyProduct = defineComponent({
  name: "EmptyProduct",
  setup() {
    return () => {
      return (
        <flex-box
          isRow={false}
          itemNum={1}
          itemConfig={[
            {
              tag: "item-1",
              isFixed: false,
              size: "",
              paddingSize: "large",
              clearPadding: ["left", "top", "bottom", "right"],
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
                  height="100%"
                  clear-padding={[]}
                  clear-border={[]}
                  class="d-flex align-center justify-center"
                >
                  <el-empty description="请选择产品后操作" image-size={60} />
                </box>
              );
            },
          }}
        </flex-box>
      );
    };
  },
});
