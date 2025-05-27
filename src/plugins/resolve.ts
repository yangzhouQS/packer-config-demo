import {InternalContext} from "../types/context.ts";
import {RsbuildConfig} from "@rsbuild/core";
import {formatEntry} from "../helpers/config.helper.ts";
import $lodash from "lodash";

export function packerPluginResolve(context: InternalContext,): RsbuildConfig {
  const {config} = context;
  const {isVue3} = formatEntry(context)
  let alias = {};
  let extensions = ['.ts', '.tsx', '.js']

  Object.assign(alias, $lodash.get(config, `global.${isVue3 ? 'browserVue3' : 'browserVue2'}.packerConfig.resolve.alias`, {}));
  const _extensions = $lodash.get(config, `global.${isVue3 ? 'browserVue3' : 'browserVue2'}.packerConfig.resolve.extensions`, []);

  if (Array.isArray(_extensions)) {
    extensions = $lodash.union(extensions.concat(_extensions));
  }

  return {
    resolve: {
      alias,
      extensions
    }
  }
}
