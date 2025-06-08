import { RsbuildConfig } from "@rsbuild/core";
import { formatEntry } from "../helpers/config.helper.ts";
import { InternalContext } from "../types/context.ts";

export async function packerVue3Plugin(context: InternalContext): Promise<RsbuildConfig> {
  const { isVue3, isVue2 } = formatEntry(context);
  // const plugins: RsbuildPlugins = [];
  // const rsbuildConfig = {
  // };
  if (isVue3) {
    /* const [{ pluginVue }, { pluginBabel }, { pluginVueJsx }, { pluginLess }] = await Promise.all([
      interopDefault(import("@rsbuild/plugin-vue")),
      interopDefault(import("@rsbuild/plugin-babel")),
      interopDefault(import("@rsbuild/plugin-vue-jsx")),
      interopDefault(import("@rsbuild/plugin-less")),
    ] as const);
    plugins.push(
      pluginBabel({
        include: /\.(?:jsx|tsx)$/,
      }),
      pluginVue(),
      pluginVueJsx({
        vueJsxOptions: {
          transformOn: true,
        },
      }),
      pluginLess(),
    ); */
    /* const { rsbuildVue3Config } = await import("@cs/webpages-packer-browser-vue3");
    rsbuildConfig = rsbuildVue3Config.rsbuildConfig; */
    // const ret = await interopDefault(import("@cs/webpages-packer-browser-vue3"));
    // console.log(ret);
  }

  if (isVue2) {
    // rsbuildConfig = {};
  }
  return {
    // plugins,
  };
}
