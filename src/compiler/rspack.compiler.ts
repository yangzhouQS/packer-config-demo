import type { Compiler, RspackOptions } from "@rspack/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { loadEnv } from "@rsbuild/core";
import { rspack, ValidationError } from "@rspack/core";
import get from "lodash.get";
import { getEntryFileSourceRoot } from "../helpers/config.helper.ts";
import { createAfterCallback } from "../helpers/process-hook.ts";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { BaseCompiler } from "./base.compiler.ts";
import { onBeforeRestart, watchFilesForRestart } from "./restart.ts";

export class RspackCompiler extends BaseCompiler {
  public async run(
    {
      configuration,
      tsConfigPath,
      rspackConfig,
      extras,
      context,
      onSuccess,
    }: RunRsbuildCompilerArgOptions,
  ) {
    const cwd = context.rootPath || process.cwd();

    const envs = loadEnv({
      cwd,
    });

    if (!rspackConfig) {
      logger.error(`Packer is building your fail..., 服务构建失败.....,请检查配置文件\n`);
      process.exit(2);
    }

    // 清除环境变量
    onBeforeRestart(envs.cleanup);

    const entryFiles = [];

    if (rspackConfig?.entry) {
      entryFiles.push(...getEntryFileSourceRoot(rspackConfig.entry));
    }

    // 监听配置文件和环境变量文件的修改
    const watchFiles = [configuration.configFilePath, ...entryFiles, ...envs.filePaths];

    const configPath = path.join(cwd, tsConfigPath!);
    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Could not find TypeScript configuration file "${tsConfigPath!}".`,
      );
    }

    const entry = get(rspackConfig as RspackOptions, "entry", {});
    if (Object.keys(entry).length === 0) {
      logger.warn("No entry found in packer-config.ts. egg.. {entries: { server: {} }}");
      return null;
    }

    const watchModeOption = extras.inputs.find(
      option => option.name === "watch",
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    const isBuildWatch = isWatchEnabled && context.action === "build";

    let compiler: Compiler | null = null;

    const afterCallback = createAfterCallback(
      onSuccess,
      isWatchEnabled,
    );

    const cliBuild = async () => {
      try {
        // compiler = rspack(rspackConfig!, isWatchEnabled ? afterCallback : undefined);
        compiler = rspack(rspackConfig, undefined);

        if (isWatchEnabled) {
          // onBeforeRestart(compiler!.close);
        }
        compiler!.run(afterCallback);

        if (isWatchEnabled) {
          watchFilesForRestart(watchFiles, async () => {
            await cliBuild();
          });
        }
      }
      catch (e) {
        if (e instanceof ValidationError) {
          logger.error(e.message);
          process.exit(2);
        }
        else if (e instanceof Error) {
          if (typeof afterCallback === "function") {
            afterCallback(e);
          }
          logger.error(e);
        }
        throw e;
      }
    };
    await cliBuild();

    try {
      // compiler = rspack(rspackConfig!, isWatchEnabled ? afterCallback : undefined);
      compiler = rspack(rspackConfig!, undefined);
    }
    catch (e) {
      if (e instanceof ValidationError) {
        logger.error(e.message);
        process.exit(2);
      }
      else if (e instanceof Error) {
        if (typeof afterCallback === "function") {
          afterCallback(e);
        }
        logger.error(e);
      }
      throw e;
    }

    if (!compiler) {
      return null;
    }

    /* const errorHandler = (error: Error | null, stats: Stats | MultiStats | undefined): void => {
      if (error) {
        logger.error(error);
        process.exit(2);
      }
      if (stats?.hasErrors()) {
        process.exitCode = 1;
      }
      if (!compiler || !stats) {
        return undefined;
      }
    };

    if (compiler && isWatchEnabled) {
      compiler.hooks.watchRun.tapAsync(`${PACKER_NAME} info`, (params, callback) => {
        logger.success(`\nSuccess Packer is building your sources...\n`);
        callback();
      });
      compiler.watch(rspackConfig!.watchOptions! || {}, afterCallback);
    }
    else if (compiler) {
      compiler.run(afterCallback);
      /!* compiler.run((error: Error | null, stats: Stats | MultiStats | undefined) => {
        logger.success(`Success Packer is building your sources..., 服务构建完成.....\n`);
        compiler.close((closeErr) => {
          if (closeErr) {
            logger.error(closeErr);
          }
          errorHandler(error, stats);
        });
      }); *!/
    }
    else {
      logger.error(`Packer is building your sources..., 服务构建失败.....\n`);
    } */
  }
}
