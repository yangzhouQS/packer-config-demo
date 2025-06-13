import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRsbuild, RsbuildInstance } from "@rsbuild/core";
import get from "lodash.get";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile";
import { BaseCompiler } from "./base.compiler";

/* const proxyHandlerMap = new Map<string, any>();

function findBestProxyMatch(path = "") {
  if (proxyHandlerMap.has(path)) {
    return proxyHandlerMap.get(path) || null;
  }
  const prefixes = Array.from(proxyHandlerMap.keys()).sort((a, b) => b.length - a.length);
  console.log("prefixes = ", prefixes, path);
  for (const prefix of prefixes) {
    if (path.startsWith(prefix)) {
      proxyHandlerMap.set(path, prefix);
      return prefix;
    }
  }
  proxyHandlerMap.set(path, null);
  return null;
}

const sites = [
  {
    proxyPrefix: "/inner",
    // targetUrl: "http://dev.yearrow.com",
    targetUrl: "http://192.168.178.1:3013",
    pathRewrite: {
      "^/inner": "/inner",
    },
    // targetUrl: "http://192.168.1:8080",
    skipPath: [],
    // skipPath: ["inner", "approveServer"],
  },
  {
    proxyPrefix: "/!*",
    targetUrl: "http://dev-mc.yearrow.com",
    skipPath: ["inner"],
  },
];
sites.forEach((item) => {
  const { proxyPrefix, targetUrl, skipPath, pathRewrite } = item;
  console.log("skipPath = ", skipPath);

  const filter = skipPath?.length > 0
    ? (pathname: string) => {
        return !skipPath.some((path) => {
          const regex = new RegExp(`^/${path}(?:/|$)`);
          return regex.test(pathname);
        });
      }
    : undefined;

  const options = {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite,
    logLevel: console,
    onProxyReq: (proxyReq: any) => {
      proxyReq.setHeader("X-Proxied-By", "nest-proxy");
    },
  };

  const handler = filter
    ? createProxyMiddleware({
        ...options,
        pathFilter: filter,
      })
    : createProxyMiddleware(options);

  console.log("proxyPrefix = ", proxyPrefix, " || ");
  proxyHandlerMap.set(proxyPrefix, handler);

  logger.info(`已代理地址：http://localhost:${proxyPrefix}:--->${targetUrl}`);
}); */

export class RsbuildCompiler extends BaseCompiler {
  public async run(
    {
      tsConfigPath,
      rsbuildConfig,
      extras,
      context,
      // onSuccess,
    }: RunRsbuildCompilerArgOptions,
  ): Promise<RsbuildInstance | undefined> {
    const cwd = context.rootPath || process.cwd();
    const configPath = path.join(cwd, tsConfigPath!);
    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Could not find TypeScript configuration file "${tsConfigPath!}".`,
      );
    }

    const entry = get(rsbuildConfig, "source.entry", {});
    if (Object.keys(entry).length === 0) {
      logger.warn("No entry found in packer-config.ts. egg.. {entries: {}}");
      return;
    }

    const watchModeOption = extras.inputs.find(
      option => option.name === "watch",
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    const isBuildWatch = isWatchEnabled && context.action === "build";

    // eslint-disable-next-line no-useless-catch
    try {
    // const afterCallback = createAfterCallback(onSuccess, isWatchEnabled);
      const rsbuild: RsbuildInstance = await createRsbuild({
        cwd,
        callerName: "webpages-packer-cli",
        rsbuildConfig,
        loadEnv: false,
      });

      /*
    * onBeforeCreateCompiler 是在创建底层 Compiler 实例前触发的回调函数，
    * 当你执行 rsbuild.startDevServer、rsbuild.build 或 rsbuild.createCompiler 时，都会调用此钩子。
    * */
      rsbuild!.onBeforeCreateCompiler(() => {
      // Skip watching files when not in dev mode or not in build watch mode
        if (rsbuild.context.action !== "dev" && !isBuildWatch) {
          // pass

        }

        // const files: string[] = [];
        // const config = rsbuild.getNormalizedConfig();
      });

      logger.debug("context.action = ", context.action);
      if (rsbuild && context.action === "dev" && isWatchEnabled) {
        /* rsbuild.onBeforeStartDevServer(({ server }) => {
          server.middlewares.use((req, res, next) => {
            console.log("---onBeforeStartDevServer -- testReqMiddle------------", req.url);
            try {
              const matchedPrefix = findBestProxyMatch(req.url);
              console.log("matchedPrefix = ", matchedPrefix);
              if (matchedPrefix) {
                const handler = proxyHandlerMap.get(matchedPrefix);
                return handler(req, res, next);
              }
            }
            catch (e) {
              logger.error("代理处理异常: ---testReqMiddle error------------", e);
            }
            next();
          });
        });

        await rsbuild.startDevServer(); */
        //  const server = await rsbuild.createDevServer();

        /* server.middlewares.use((req, res, next) => {
          console.log("---------------", req.url);
          next();
        });

        server.listen(); */

        // await createPackerDevServer(rsbuild);

        /* const { proxyPrefix, targetUrl, skipPath } = {
          proxyPrefix: "/inner",
          // targetUrl: "http://dev-mc.yearrow.com",
          targetUrl: "http://10.0.0.2:3013",
          skipPath: ["inner"],
        };
        if (proxyPrefix) {
          const pathFilter = (pathname: string, req: any) => {
            console.log(`pathname = ${pathname}`);
            let flag = 0;
            // eslint-disable-next-line array-callback-return
            skipPath.map((i) => {
              if (pathname.match(`/${i}/`))
                flag++;
            });
            return !(flag > 0);
          };
          server.middlewares.use(proxyPrefix, createProxyMiddleware({ pathFilter, target: targetUrl, changeOrigin: true }));
        }
        else {
          server.middlewares.use(proxyPrefix, createProxyMiddleware({ target: targetUrl, changeOrigin: true }));
        } */

        // await server.listen();
      }

      if (rsbuild && context.action === "build") {
        const buildInstance = await rsbuild.build({
          watch: isWatchEnabled,
        });

        /*
      * 关闭构建实例
      * */
        if (buildInstance) {
          await buildInstance.close();
          logger.info("------------build website end----------------");
        /* if (isWatchEnabled) {
          onBeforeRestartServer(buildInstance.close);
        }
        else {
          await buildInstance.close();
          logger.info("------------build website end----------------");
        } */
        }
      }

      return rsbuild!;
    }
    catch (error) {
      throw error;
    }
  }
}
