import { RsbuildConfig } from "@rsbuild/core";
import { interopDefault } from "../helpers";
import { formatEntry } from "../helpers/config.helper.ts";
import { InternalContext } from "../types/context.ts";

export async function packerVue3Plugin(context: InternalContext): Promise<RsbuildConfig> {
  const { isVue3, isVue2 } = formatEntry(context);
  const rsbuildConfig = {};

  if (isVue3) {
    const { createVue3Config } = await interopDefault(import("@cs/webpages-packer-browser-vue3"));
    const vue3Config = await createVue3Config();
    Object.assign(rsbuildConfig, vue3Config.rsbuildConfig);
  }

  if (isVue2) {
    /* const { createVue2Config } = await interopDefault(import("@cs/webpages-packer-browser-vue2"));
    const vue2Config = await createVue3Config();
    Object.assign(rsbuildConfig, vue2Config.rsbuildConfig); */
  }
  return rsbuildConfig;
}
