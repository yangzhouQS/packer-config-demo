import {logger} from "../logger.ts";
import {InternalContext} from "../types/context.ts";
import {RsbuildConfig} from "@rsbuild/core";
import $lodash from "lodash";

/**
 * 打包插件开发环境配置
 * @param {InternalContext} context
 * @returns {RsbuildConfig}
 */
export function packerPluginDev(context: InternalContext,): RsbuildConfig {
  logger.debug('--------------packerPluginDev------------------');

  const hmr = $lodash.get(context.config, 'server.hmr', true);
  const progressBar = $lodash.get(context.config, 'server.progressBar', true);
  return {
    dev: {
      hmr,
      progressBar,
      writeToDisk: (file) => !file.includes('.hot-update.'),
      lazyCompilation:{
        entries: true,
        imports: true,
      }
    }
  }
}
