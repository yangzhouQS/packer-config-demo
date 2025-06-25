import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRsbuild, RsbuildInstance } from "@rsbuild/core";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile";
import { BaseCompiler } from "./base.compiler";

export class RsbuildServerCompiler extends BaseCompiler {
  public async run(
    {
      tsConfigPath,
      rsbuildServerConfig,
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

    /* const entry = get(rsbuildConfig, "source.entry", {});
    if (Object.keys(entry).length === 0) {
      logger.warn("server config No entry found in packer-config.ts. egg.. {entries: {}}");
      return;
    } */

    const watchModeOption = extras.inputs.find(
      option => option.name === "watch",
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    const isBuildWatch = isWatchEnabled && context.action === "build";
    console.log("isBuildWatch: ", isBuildWatch);

    // eslint-disable-next-line no-useless-catch
    try {
      // const afterCallback = createAfterCallback(onSuccess, isWatchEnabled);
      const rsbuild: RsbuildInstance = await createRsbuild({
        cwd,
        callerName: "webpages-packer-node-server-build",
        rsbuildConfig: rsbuildServerConfig,
        loadEnv: false,
      });
      logger.debug("context.action = ", context.action);
      if (rsbuild && context.action === "dev" && isWatchEnabled) {
        // await rsbuild.startDevServer();
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
        }
      }

      return rsbuild!;
    }
    catch (error) {
      throw error;
    }
  }
}
