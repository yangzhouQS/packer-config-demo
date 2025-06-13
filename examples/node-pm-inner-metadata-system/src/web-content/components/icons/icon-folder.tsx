import { defineComponent } from "vue";
import SvgIcon from "./svg-icon";

export const IconFolder = defineComponent({
  name: "IconFlowBranch",
  setup() {
    return () => {
      return (
        <SvgIcon>
          <path
            d="M85.312 153.6v716.8h853.376V288H471.36L364.416 153.6h-279.04zM0 64h404.288L511.36 198.4H1024V960H0V64z"
            fill="currentColor"
            p-id="3587"
          >
          </path>
        </SvgIcon>
      );
    };
  },
});
