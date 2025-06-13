import { defineComponent } from "vue";
import { RoleList } from "./role-list";
import { RolePermissionTable } from "./role-permission-table";

export const MainPage = defineComponent({
  name: "MainPage",
  setup() {
    return () => {
      return (
        <div class="main-page">
          <flex-box
            isRow={true}
            itemNum={2}
            itemConfig={[
              {
                tag: "item-1",
                isFixed: true,
                showDragButton: true,
                dragButtonPosition: "right",
                size: "260px",
                paddingSize: "large",
                clearPadding: ["right"],
              },
              {
                tag: "item-2",
                isFixed: false,
                size: "",
                paddingSize: "large",
                clearPadding: [],
              },
            ]}
          >
            {{
              "item-1": () => {
                return <RoleList />;
              },
              "item-2": () => {
                return <RolePermissionTable />;
              },
            }}
          </flex-box>
        </div>
      );
    };
  },
});
