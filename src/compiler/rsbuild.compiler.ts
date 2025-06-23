import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRsbuild, RsbuildInstance } from "@rsbuild/core";
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
      configuration,
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

    /* const envs = loadEnv({
      cwd: context.rootPath,
      mode: getNodeEnv(),
    }); */

    const entry = get(rsbuildConfig, "source.entry", {});
    if (Object.keys(entry).length === 0) {
      logger.warn("No entry found in packer-config.ts. egg.. {entries: {}}");
      return;
    }

    const watchFiles = [configuration.configFilePath/* ...envs.filePaths */];
    const watchModeOption = extras.inputs.find(
      option => option.name === "watch",
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    const isBuildWatch = isWatchEnabled && context.action === "build";

    console.log(`isBuildWatch = ${isBuildWatch}, isWatchEnabled = ${isWatchEnabled}`);

    // 打包器配置文件监听
    // onBeforeRestartServer(envs.cleanup);

    console.log("rsbuildConfig-->", rsbuildConfig);
    // eslint-disable-next-line no-useless-catch
    try {
      // const afterCallback = createAfterCallback(onSuccess, isWatchEnabled);
      const rsbuild: RsbuildInstance = await createRsbuild({
        cwd,
        callerName: "webpages-packer-cli",
        rsbuildConfig,
        loadEnv: false,
      });

      logger.debug("context.action = ", context.action);

      console.log("-------watchFiles -------------", watchFiles);

      if (rsbuild && rsbuild.context.action === "dev") {
        console.log("rsbuild");
        await rsbuild.startDevServer();
      }
      /* if (isWatchEnabled || isBuildWatch) {
        // 配置文件修改后重新启动
        watchFilesForRestart({
          files: watchFiles,
          rsbuild,
          isBuildWatch,
        });
      } */

      rsbuild.onBeforeCreateCompiler(() => {
        console.log("----------onBeforeCreateCompiler-----------");
      });

      /*
        * onBeforeCreateCompiler 是在创建底层 Compiler 实例前触发的回调函数，
        * 当你执行 rsbuild.startDevServer、rsbuild.build 或 rsbuild.createCompiler 时，都会调用此钩子。
        * */
      /* rsbuild.onBeforeCreateCompiler(() => {
        // Skip watching files when not in dev mode or not in build watch mode
        /!* if (rsbuild.context.action !== "dev" && !isBuildWatch) {
          // pass
        } *!/

        const files: string[] = [];
        const config = rsbuild.getNormalizedConfig();
        console.log("-------config.dev?.watchFiles--->", config.dev?.watchFiles);
        if (config.dev?.watchFiles) {
          for (const watchFilesConfig of castArray(config.dev.watchFiles)) {
            /!* if (watchFilesConfig.type !== "reload-server") {
              continue;
            } *!/

            console.log("isBuildWatch : 打包及其监听文件修改");

            const paths = castArray(watchFilesConfig.paths);
            paths.push(...watchFiles);
            if (isBuildWatch && watchFilesConfig.options) {
              // pass 先不考虑监听参数传递
              watchFilesForRestart({
                files: paths,
                rsbuild,
                isBuildWatch,
                watchOptions: watchFilesConfig.options,
              });
            }
            else {
              files.push(...paths);
            }
          }
        }

        /!* if (rsbuild && rsbuild.context.action === "dev") {
          watchFilesForRestart({
            files,
            rsbuild,
            isBuildWatch,
          });
        } *!/
      }); */

      if (rsbuild && context.action === "build") {
        const buildInstance = await rsbuild.build({
          watch: isWatchEnabled,
        });

        // 关闭构建实例
        if (buildInstance) {
          await buildInstance.close();
        /* if (isWatchEnabled) {
          onBeforeRestartServer(buildInstance.close);
        }
        else {
          await buildInstance.close();
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
