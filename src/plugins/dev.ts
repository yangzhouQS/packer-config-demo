import { RsbuildConfig } from "@rsbuild/core";
import get from "lodash.get";
import { logger } from "../logger.ts";
import { InternalContext } from "../types/context.ts";

// import express from "express";
// const app = express();
// console.log(express);

/**
 * 打包插件开发环境配置
 * @param {InternalContext} context
 * @returns {RsbuildConfig}
 */
export function packerPluginDev(context: InternalContext): RsbuildConfig {
  logger.debug("--------------packerPluginDev------------------");

  const hmr = get(context.config, "server.hmr", true);
  const progressBar = get(context.config, "server.progressBar", true);
  return {
    dev: {
      // assetPrefix: "inner",
      client: {
        overlay: true,
      },
      hmr,
      progressBar,
      writeToDisk: file => !file.includes(".hot-update."),
      lazyCompilation: {
        entries: true,
        imports: true,
      },
      watchFiles: {
        paths: ["src/web-content/**/*"],
      },
      /* setupMiddlewares: [
        (middlewares, devServer) => {
          middlewares.unshift((req, res, next) => {
            // console.log("first", req.url);
            next();
          });
        },
      ], */
    },
  };
}
