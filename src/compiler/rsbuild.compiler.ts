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
        await rsbuild.startDevServer();
        /* await rsbuild.build({
          watch: isWatchEnabled,
        }); */
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
