import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { loadEnv } from "@rsbuild/core";

import { Compiler, RspackOptions, ValidationError } from "@rspack/core";
import get from "lodash.get";
import { getEntryFileSourceRoot } from "../helpers/config.helper.ts";
import { createAfterCallback } from "../helpers/process-hook.ts";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { BaseCompiler } from "./base.compiler.ts";
import { createRspackCompiler } from "./compiler.ts";
import { onBeforeRestart, watchFilesForRestart } from "./restart.ts";

const EXIT_SIGNALS = ["SIGINT", "SIGTERM"];
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
    console.log("000000000000000---RspackCompiler");
    logger.debug("create rspack compiler");
    const cwd = context.rootPath || process.cwd();

    const envs = loadEnv({
      cwd,
    });

    if (!rspackConfig) {
      logger.error(`Packer is building your fail..., 服务构建失败.....,请检查配置文件\n`);
      process.exit(2);
    }

    // rspackConfig.watch = false;
    console.log("rspackConfig.watch = ", rspackConfig.watch);
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

    const afterCallback = createAfterCallback(
      onSuccess,
      isWatchEnabled,
    );

    let compiler: Compiler | null = null;

    /* const callback = (error: Error | null, stats: Rspack.Stats | Rspack.MultiStats | undefined): void => {
      if (error) {
        logger.error(error);
        process.exit(2);
      }

      if (stats && stats.hasErrors()) {
        process.exitCode = 1;
      }

      if (!compiler || !stats) {
        return undefined;
      }
    }; */

    const cliBuild = async () => {
      try {
        compiler = await createRspackCompiler(rspackConfig, isWatchEnabled ? afterCallback : undefined);

        if (!compiler) {
          return null;
        }

        /* if (isWatchEnabled) {
          let needForceShutdown = false;

          EXIT_SIGNALS.forEach((signal) => {
            const listener = () => {
              if (needForceShutdown) {
                process.exit(0);
              }

              logger.info(
                "Gracefully shutting down. To force exit, press ^C again. Please wait...",
              );

              needForceShutdown = true;

              compiler!.close(() => {
                process.exit(0);
              });
            };

            process.on(signal, listener);
          });
        }

        // compiler!.run(afterCallback);

        if (compiler.options.watchOptions?.stdin) {
          process.stdin.on("end", () => {
            process.exit(0);
          });
          process.stdin.resume();
        } */

        if (isWatchEnabled) {
          await watchFilesForRestart(watchFiles, async () => {
            compiler!.close(() => {});
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

    if (!compiler) {
      return null;
    }

    if (isWatchEnabled) {
      logger.greet("-----开启了文件监听模式---");
      /* compiler.watch({}, (error) => {
        if (error) {
          logger.error(error);
        }
      }); */
    }

    /* if (compiler && isWatchEnabled) {
      compiler.hooks.watchRun.tapAsync(`${PACKER_NAME} info`, (params, callback) => {
        logger.success(`\nSuccess Packer is building your sources...\n`);
        callback();
      });
      compiler.watch(rspackConfig!.watchOptions! || {}, afterCallback);
    }
    else if (compiler) {
      // compiler.run(afterCallback);
      compiler.run((error: Error | null, stats: Stats | MultiStats | undefined) => {
        logger.success(`Success Packer is building your sources..., 服务构建完成.....\n`);
        compiler.close((closeErr) => {
          if (closeErr) {
            logger.error(closeErr);
          }
          errorHandler(error, stats);
        });
      });
    }
    else {
      logger.error(`Packer is building your sources..., 服务构建失败.....\n`);
    } */
  }
}
