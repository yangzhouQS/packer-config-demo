import { Close } from "@element-plus/icons-vue";
import { defineComponent } from "vue";

export const CmpCancelSave = defineComponent({
  name: "CmpCancelSave",
  props: {
    cancelText: {
      type: String,
      default: "取消",
    },
    saveText: {
      type: String,
      default: "保存",
    },
    saveDisabled: {
      type: Boolean,
      default: false,
    },
    saveLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    return () => {
      return (
        <box padding-size="base">
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
                      onClick={() => {
                        emit("cancel");
                      }}
                      icon={Close}
                    >
                      {props.cancelText}
                    </el-button>
                    <el-button
                      type="primary"
                      onClick={() => {
                        emit("save");
                      }}
                      disabled={props.saveDisabled}
                      loading={props.saveLoading}
                    >
                      <i class="cs-common baocun el-icon--left"></i>
                      {props.saveText}
                    </el-button>
                  </>
                );
              },
            }}
          </flex-line>
        </box>
      );
    };
  },
});
