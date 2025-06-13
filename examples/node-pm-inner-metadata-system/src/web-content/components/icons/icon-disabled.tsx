import { defineComponent } from "vue";
import SvgIcon from "./svg-icon";

export const IconDisabled = defineComponent({
  name: "IconDisabled",
  setup() {
    return () => {
      return (
        <SvgIcon>
          <path fill="#ff0101" d="M352 480h320a32 32 0 1 1 0 64H352a32 32 0 0 1 0-64"></path>
          <path
            fill="#ff0101"
            d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
          >
          </path>
        </SvgIcon>
      );
    };
  },
});
