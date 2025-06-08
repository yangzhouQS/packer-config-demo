import type { RspackOptions } from "@rspack/core";
import path from "node:path";
import { merge as webpackMerge } from "webpack-merge";
import { __dirname } from "../constants.ts";
import { getNodeEnv } from "../helpers";
import { formatEntry } from "../helpers/config.helper.ts";
import { DEFAULT_RSPACK_CONFIG } from "../helpers/default.config.ts";
import { InternalContext } from "../types/context.ts";
/**
 * 创建服务端打包配置
 * @param {InternalContext} context
 * @returns {{mode: string, output: {path: string, filename: string}, entry: {[p: string]: string}, resolve: {extensions: string[]}, ignoreWarnings: any[], experiments: {lazyCompilation: {entries: boolean, imports: boolean}}, module: {rules: any[]}, context: string, externals: any[], externalsPresets: {node: boolean}}}
 */
export function packerServicePlugin(context: InternalContext): RspackOptions {
  const { nodeEntries, isServerBuild } = formatEntry(context);
  const entryConfig: Record<string, string> = {};
  const outputConfig: Record<string, string> = {
    path: "",
    filename: "[name].js",
  };
  if (nodeEntries.length > 0 && isServerBuild) {
    const serverConfig = nodeEntries[0];
    entryConfig[serverConfig.entryKey] = path.resolve(context.rootPath, serverConfig.input);
    outputConfig.path = path.resolve(context.rootPath, serverConfig.output?.filePath || "dist");
    outputConfig.filename = serverConfig.output?.fileName || "[name].js" || "main.js";
  }
  const rspackConfiguration: RspackOptions = {
    context: context.rootPath || __dirname,
    mode: getNodeEnv() || "none",
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      // tsConfig: path.resolve(__dirname, "./tsconfig.json"),
    },
    experiments: {
      // lazyCompilation: true,
      lazyCompilation: {
        entries: true,
        imports: true,
      },
    },
    entry: {
      // main: "./src/controllers/main.ts",
      ...entryConfig,
    },
    output: {
      // path: path.resolve(__dirname, "./dist"),
      filename: "[name].js",
      ...outputConfig,
    },
    ignoreWarnings: [],
    externals: [],
    externalsPresets: { node: true },
    module: {
      rules: [
      ],
    },
  };
  if (context.action === "build") {
    // pass
  }

  return webpackMerge(DEFAULT_RSPACK_CONFIG, rspackConfiguration);
}
