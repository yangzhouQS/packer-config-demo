import { defineComponent } from "vue";

export const EmptyDanger = defineComponent({
  name: "EmptyDanger",
  props: {
    width: {
      type: String,
      default: "40px",
    },
  },
  setup(props) {
    return () => {
      return <div class="d-inline-block empty-danger-width" style={{ width: props.width }} />;
    };
  },
});
