import { RsbuildConfig } from "@rsbuild/core";
import get from "lodash.get";
import { formatEntry } from "../helpers/config.helper.ts";
import { InternalContext } from "../types/context.ts";

export function packerPluginResolve(context: InternalContext): RsbuildConfig {
  const { config } = context;
  const { isVue3 } = formatEntry(context);
  const alias = {};
  let extensions = [".ts", ".tsx", ".js"];

  Object.assign(alias, get(config, `global.${isVue3 ? "browserVue3" : "browserVue2"}.packerConfig.resolve.alias`, {}));
  const _extensions = get(config, `global.${isVue3 ? "browserVue3" : "browserVue2"}.packerConfig.resolve.extensions`, []);

  if (Array.isArray(_extensions)) {
    extensions = extensions.concat(_extensions);
  }

  return {
    resolve: {
      alias,
      extensions,
    },
  };
}
