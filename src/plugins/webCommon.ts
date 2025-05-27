import {InternalContext} from "../types/context.ts";
import {RsbuildConfig} from "@rsbuild/core";
import {formatEntry} from "../helpers/config.helper.ts";


export async function packerWebCommonPlugin(context: InternalContext): Promise<RsbuildConfig> {
  const {isVue3,isVue2} = formatEntry(context);
  let rsbuildConfig = {

  };
  if(isVue3){
    // const {rsbuildVue3Config}  = await import("@cs/webpages-packer-browser-vue3");
    // rsbuildConfig = rsbuildVue3Config.rsbuildConfig
  }

  if (isVue2){
    rsbuildConfig = {}
  }
  return rsbuildConfig
}
