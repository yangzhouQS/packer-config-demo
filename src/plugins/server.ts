import { RsbuildConfig } from "@rsbuild/core";
import get from "lodash.get";
import { InternalContext } from "../types/context.ts";

/**
 * 本地开发服务配置
 * @param {InternalContext} context
 * @returns {RsbuildConfig}
 */
export function packerPluginServer(context: InternalContext): RsbuildConfig {
  let prefix = get(context.config, "server.prefix", "");
  if (prefix && !prefix.startsWith("/")) {
    prefix = `/${prefix}`;
  }
  const port = get(context.config, "server.port", 8080);

  const proxy = {
    /* "/api": {
      target: "http://10.0.0.2:3013",
      pathRewrite: { "^/api": "" },
    }, */
  };

  return {
    server: {
      proxy,
      // 在本地开发和预览时都会生效
      host: "0.0.0.0",
      base: prefix,
      port,
      cors: true,
      // middlewareMode: true,
    },
  };
}
