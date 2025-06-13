import { computed, defineComponent, PropType } from "vue";

export const SelectSetter = defineComponent({
  name: "SelectSetter",
  props: {
    value: [Object, String, Number],
    defaultValue: Object as PropType<any>,
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    onChange: {
      type: Function,
      default: () => {},
    },
  },
  emits: ["update:value"],
  setup(props, { emit }) {
    const formatOptions = (options: any[] | undefined): any[] => {
      if (options) {
        return options.map((item: any) => {
          return {
            label: item.label || item.title || "-",
            value: item.value,
            disabled: item.disabled || false,
          };
        });
      }
      return [];
    };

    const state = computed({
      get: () => props.value,
      set: (val) => {
        emit("update:value", val);
      },
    });

    const change = (val) => {
      props.onChange?.(val);
    };

    return () => {
      return (
        <el-select
          v-model={state.value}
          size="default"
          placeholder={props.placeholder}
          class="w-full"
          onChange={change}
          filterable={true}
          clearable={props.clearable}
        >
          {formatOptions(props.options).map((opt, index) => {
            return (
              <el-option key={index} disabled={opt.disabled} value={opt.value} label={opt.label}>
                {opt.label}
              </el-option>
            );
          })}
        </el-select>
      );
    };
  },
});
