import { mergeRsbuildConfig, RsbuildConfig } from "@rsbuild/core";
import { formatEntry } from "../helpers/config.helper.ts";
import { InternalContext } from "../types/context.ts";
import { packerVue3Plugin } from "./vue3-plugin.ts";
// import {rsbuildVue3Config} from '@cs/webpages-packer-browser-vue3';

export async function packerWebCommonPlugin(context: InternalContext): Promise<RsbuildConfig> {
  const { isVue3, isVue2 } = formatEntry(context);
  let rsbuildConfig = {
    // root: context.rootPath,
    // plugins: [],
  };
  if (isVue3) {
    const vue3Config = await packerVue3Plugin(context);
    rsbuildConfig = mergeRsbuildConfig(rsbuildConfig, vue3Config);
    // const {rsbuildVue3Config}  = await import("@cs/webpages-packer-browser-vue3");
    // rsbuildConfig = rsbuildVue3Config.rsbuildConfig
  }

  if (isVue2) {
    Object.assign(rsbuildConfig, {});
  }
  return rsbuildConfig;
}
