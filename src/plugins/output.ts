import {RsbuildConfig} from "@rsbuild/core";
import {InternalContext} from "../types/context.ts";
import path from "node:path";
import {formatEntry} from "../helpers/config.helper.ts";
import $lodash from "../../compiled/lodash";

export function PackerPluginOutput(context: InternalContext,): RsbuildConfig {
  const _copy: { from: string; to: string; }[] = [];
  const {config,rootPath} = context;
  const copy = config.global?.copy || {};

  const {isVue2,isVue3} = formatEntry(context)
  let externals = {};
  if(isVue3){
    externals = $lodash.get(config,'global.browserVue3.packerConfig.externals', {});
  }
  if(isVue2){
    externals = $lodash.get(config,'global.browserVue2.packerConfig.externals', {});
  }

  Object.keys(copy).forEach((key) => {
    _copy.push({
      from: key,
      to: path.resolve(rootPath, copy[key]),
    });
  });

  return {
    output: {
      copy: _copy,
      externals
    }
  }
}
