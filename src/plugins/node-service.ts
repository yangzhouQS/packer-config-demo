import type { RspackOptions } from "@rspack/core";
import path from "node:path";
import process from "node:process";
import { mergeRsbuildConfig, RsbuildConfig } from "@rsbuild/core";
import fse from "fs-extra";
import get from "lodash.get";
import { merge as webpackMerge } from "webpack-merge";
import { __dirname } from "../constants.ts";
import { getNodeEnv } from "../helpers";
import { formatEntry } from "../helpers/config.helper.ts";
import { DEFAULT_RSPACK_CONFIG, getIgnorePlugin } from "../helpers/default.config.ts";
import { logger } from "../logger.ts";
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
    const inputPath = path.resolve(context.rootPath, serverConfig.input);
    if (!fse.existsSync(inputPath)) {
      logger.error(`服务打包入口:${inputPath} not exists`);
      process.exit(1);
    }
    entryConfig[serverConfig.entryKey] = inputPath;
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
    devServer: {
      watchFiles: {
        paths: ["src/"],
      },
    },
    watch: true,
    watchOptions: {
      ignored: ["**/files/**/*.js", "**/.git", "**/node_modules", "**/log/", "**/dist/**", "**/lib/**"],
      aggregateTimeout: 200,
      poll: 2000,
    },
  };
  if (context.action === "build") {
    // pass
  }

  return webpackMerge(DEFAULT_RSPACK_CONFIG, rspackConfiguration);
}

export async function rsbuildServerPlugin(context: InternalContext): Promise<RsbuildConfig> {
  logger.info("----------------rsbuildServerPlugin-------------------");
  const { nodeEntries, isServerBuild } = formatEntry(context);
  const entryConfig: Record<string, string> = {};
  const outputConfig: Record<string, string> = {
    path: "",
    filename: "[name].js",
  };
  if (nodeEntries.length > 0 && isServerBuild) {
    const serverConfig = nodeEntries[0];
    const inputPath = path.resolve(context.rootPath, serverConfig.input);
    if (!fse.existsSync(inputPath)) {
      logger.error(`服务打包入口:${inputPath} not exists`);
      process.exit(1);
    }
    entryConfig[serverConfig.entryKey] = inputPath;
    outputConfig.path = path.resolve(context.rootPath, serverConfig.output?.filePath || "dist");
    outputConfig.filename = serverConfig.output?.fileName || "[name].js" || "main.js";
  }
  const externals = get(context.config, "global.node.packerConfig.externals", []);
  const ignoreWarnings = get(context.config, "global.node.packerConfig.ignoreWarnings", []);
  const _rsbuildConfig = get(context.config, "global.node.packerConfig.rsbuildConfig", {});

  const config = {
    mode: process.env.NODE_ENV || "none",
    root: context.rootPath || process.cwd(),
    plugins: [
    ],
    logLevel: "info",
    source: {
      decorators: {
        version: "legacy",
      },
    },
    output: {
      externals,
      cleanDistPath: {
        enable: true,
        keep: [/dist\/cofnig.yaml/],
      },
    },

    dev: {},
    server: {},
    tools: {
      rspack: {
        target: "node",
        optimization: {
          minimize: false, // 对产物进行压缩
          nodeEnv: false,
        },
        node: {
          __dirname: false,
          __filename: false,
        },
        devtool: "source-map",
        plugins: [
          ...getIgnorePlugin(),
        ],
        stats: { preset: "errors-warnings", timings: true },
        watchOptions: {
          ignored: /node_modules/,
          poll: 1000, // 轮询监听时间
        },
        ignoreWarnings: [/^(?!CriticalDependenciesWarning$)/, ...ignoreWarnings],
        externalsPresets: { node: true },
        resolve: {
          extensions: [".ts", ".js"],
        },
        experiments: {
          // lazyCompilation: true,
          lazyCompilation: {
            entries: true,
            imports: true,
          },
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: {
                    syntax: "typescript",
                  },
                },
              },
              type: "javascript/auto",
            },
          ],
        },
      },
    },
    devServer: {
      watchFiles: {
        paths: ["src/"],
      },
    },
  } as RsbuildConfig;

  return mergeRsbuildConfig(config, _rsbuildConfig);
}
