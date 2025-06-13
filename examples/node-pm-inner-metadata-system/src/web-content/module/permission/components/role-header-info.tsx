import { frameStore } from "@cs/js-inner-web-framework";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { defineComponent } from "vue";
import { apiRole } from "../../../components/api-config/api-role";
import { EmptyDanger } from "../../../components/empty-danger/empty-danger";
import { GlobalMessage } from "../../../components/global/global-message";
import { IconRole } from "../../../components/icons";
import { errorMessage, roleEvent } from "../../../utils/utils";
import { RoleEventConfig } from "./role-config";

export const RoleHeaderInfo = defineComponent({
  name: "RoleHeaderInfo",
  props: {
    activeRole: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const permissions = frameStore.$context?.permissions || [];

    const methods = {
      editRole: () => {
        roleEvent.emit("role-edit", props.activeRole);
      },
      /* 角色删除 */
      rowRemoveRole: () => {
        ElMessageBox.confirm(
          `是否删除角色：${props.activeRole.name}`,
          "删除警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(() => {
            apiRole.removeRole(props.activeRole.id).then(({ result }) => {
              if (result.success) {
                GlobalMessage.success("角色删除成功");
                // methods.handleClose();
                // methods.loadData();
                roleEvent.emit(RoleEventConfig.roleRemove);
                roleEvent.emit(RoleEventConfig.roleReload);
              }
              else {
                const message = result.roleUsers.map(item => item.name);
                GlobalMessage.warning(`${props.activeRole.name}下存在用户：${message}，请先删除用户授权后再删除角色`);
              }
            }).catch((error) => {
              GlobalMessage.error(errorMessage(error, "角色删除失败"));
            });
          })
          .catch(() => {
          });
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
                    <span><IconRole class="mr-2" /></span>
                    {
                      props.activeRole.id > 0 && (
                        <>
                          <span>{props.activeRole.name}</span>
                        </>
                      )
                    }
                  </div>
                );
              },
              right: () => {
                return (
                  <span>
                    {permissions.includes("pm-inner-metadata-role-permission-edit") && (
                      <el-button
                        disabled={!(props.activeRole.id > 0)}
                        type="primary"
                        icon={Edit}
                        plain
                        onClick={methods.editRole}
                      >
                        角色
                      </el-button>
                    )}
                    {permissions.includes("pm-inner-metadata-role-permission-remove")
                      && (
                        <>
                          <EmptyDanger />
                          <el-button
                            type="danger"
                            plain
                            disabled={!(props.activeRole.id > 0)}
                            icon={Delete}
                            onClick={methods.rowRemoveRole}
                          >
                            角色
                          </el-button>
                        </>
                      )}
                  </span>
                );
              },
            }}
          </flex-line>
        </box>
      );
    };
  },
});
