import { defineComponent } from "vue";
import { RoleTable } from "./role-table";
import { UserList } from "./user-list";

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
                size: "260px",
                showDragButton: true,
                dragButtonPosition: "right",
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
                return <UserList />;
              },
              "item-2": () => {
                return <RoleTable />;
              },
            }}
          </flex-box>
        </div>
      );
    };
  },
});
