import { defineComponent } from "vue";

interface SvgProps {
  size: string;
  viewBox?: string;
  style?: object;
}

export default defineComponent({
  name: "LeftArea",
  props: {
    size: {
      type: Number,
      default: 14,
    },
    viewBox: {
      type: String,
      default: "0 0 1024 1024",
    },
    click: Function,
  },
  setup(props: SvgProps, { slots }) {
    const size = props.size;
    return () => {
      return (
        <svg aria-hidden="true" fill="currentColor" width={size} height={size} viewBox={props.viewBox}>
          {slots?.default?.()}
        </svg>
      );
    };
  },
});
