import {InternalContext} from "../types/context.ts";
import {RsbuildConfig} from "@rsbuild/core";
import $lodash from "lodash";

/**
 * 本地开发服务配置
 * @param {InternalContext} context
 * @returns {RsbuildConfig}
 */
export function packerPluginServer(context: InternalContext,): RsbuildConfig {
  const prefix = $lodash.get(context.config, 'server.prefix', '');
  const port = $lodash.get(context.config, 'server.port', 8080);
  return {
    server: {
      // 在本地开发和预览时都会生效
      host: '0.0.0.0',
      base: prefix,
      port: port,
      cors: true,
    }
  }
}
