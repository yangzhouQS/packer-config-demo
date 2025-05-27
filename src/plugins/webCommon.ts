import {InternalContext} from "../types/context.ts";
import {RsbuildConfig} from "@rsbuild/core";
import {formatEntry} from "../helpers/config.helper.ts";
import {rsbuildVue3Config} from '@cs/webpages-packer-browser-vue3';

export async function packerWebCommonPlugin(context: InternalContext): Promise<RsbuildConfig> {
  const {isVue3, isVue2} = formatEntry(context);
  let rsbuildConfig = {
    root: context.rootPath,
    plugins: []
  };
  if (isVue3) {
    console.log(rsbuildVue3Config);
    // const {rsbuildVue3Config}  = await import("@cs/webpages-packer-browser-vue3");
    // rsbuildConfig = rsbuildVue3Config.rsbuildConfig
  }

  if (isVue2) {
    Object.assign(rsbuildConfig, {});
  }
  return rsbuildConfig
}
