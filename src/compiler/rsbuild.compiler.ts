import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRsbuild, RsbuildInstance } from "@rsbuild/core";
import { createProxyMiddleware } from "http-proxy-middleware";
import get from "lodash.get";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile";
import { BaseCompiler } from "./base.compiler";

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
        // await rsbuild!.startDevServer();
        const server = await rsbuild.createDevServer();
        // console.log(server);

        server.middlewares.use((req, res, next) => {
          console.log("---------------", req.url);
          next();
        });

        const sites = [
          {
            proxyPrefix: "/inner",
            // targetUrl: "http://dev.yearrow.com",
            targetUrl: "http://10.0.0.2:3013",
            // targetUrl: "http://192.168.1:8080",
            // skipPath: ["approve", "approveServer"]
          },
          {
            proxyPrefix: "/*",
            targetUrl: "http://dev-mc.yearrow.com",
            skipPath: ["inner"],
          },
        ];
        sites.forEach((item) => {
          const { proxyPrefix, targetUrl, skipPath } = item;
          if (skipPath) {
            const pathFilter = function (pathname: string) {
              console.log(`pathname = ${pathname}`);
              let flag = 0;
              // eslint-disable-next-line array-callback-return
              skipPath.map((i) => {
                if (pathname.match(`/${i}/`))
                  flag++;
              });
              console.log("--------!(flag > 0)----------", !(flag > 0));
              return !(flag > 0);
            };
            console.log("00000000000000000000", proxyPrefix);
            server.middlewares.use("**", createProxyMiddleware({
              logger: true,
              pathFilter,
              target: targetUrl,
              changeOrigin: true,
              on: {
                proxyReq: (proxyReq, req, res) => {
                  console.log("proxyReq----------");
                  /* handle proxyReq */
                },
                proxyRes: (proxyRes, req, res) => {
                  /* handle proxyRes */
                  console.log("proxyRes----------");
                },
                error: (err, req, res) => {
                  /* handle error */
                  console.log("err----------");
                },
              },
            }));
          }
          else {
            console.log("1111111111111111111111", proxyPrefix);
            server.middlewares.use(proxyPrefix, createProxyMiddleware({ logger: true, target: targetUrl, changeOrigin: true }));
          }

          logger.info(`已代理地址：http://localhost:${server.port}${proxyPrefix}:--->${targetUrl}`);
        });

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

        await server.listen();
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
