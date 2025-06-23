import path from "node:path";
import { RsbuildConfig } from "@rsbuild/core";
import get from "lodash.get";
import { formatEntry } from "../helpers/config.helper.ts";
import { copyFiles } from "../helpers/files-utils.ts";
import { InternalContext } from "../types/context.ts";

export function packerPluginOutput(context: InternalContext): RsbuildConfig {
  const _copy: { from: string; to: string }[] = [];
  const { config, rootPath } = context;
  const copy = config.global?.copy || {};

  const { isVue2, isVue3 } = formatEntry(context);
  let externals = {};
  if (isVue3) {
    externals = get(config, "global.browserVue3.packerConfig.externals", {});
  }
  if (isVue2) {
    externals = get(config, "global.browserVue2.packerConfig.externals", {});
  }

  Object.keys(copy).forEach((key) => {
    _copy.push({
      from: key,
      to: path.resolve(rootPath, copy[key]),
    });
  });
  if (copy && Object.keys(copy).length > 0) {
    copyFiles(copy, rootPath);
  }

  return {
    output: {
      target: "web",
      assetPrefix: "./",
      cleanDistPath: false,
      // polyfill: "entry",
      // copy: _copy,
      externals,
      overrideBrowserslist: [
        "> 1%",
        "not ie <= 10",
        "iOS >= 9",
        "Android >= 4.4",
        "last 2 versions",
        "> 0.2%",
        "not dead",
      ],
    },
  };
}
