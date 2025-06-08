import type { Compiler, RspackOptions } from "@rspack/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { rspack, ValidationError } from "@rspack/core";

import get from "lodash.get";
import { createAfterCallback } from "../helpers/process-hook.ts";
import { logger } from "../logger.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { BaseCompiler } from "./base.compiler.ts";

export class RspackCompiler extends BaseCompiler {
  public run(
    {
      tsConfigPath,
      rspackConfig,
      extras,
      context,
      onSuccess,
    }: RunRsbuildCompilerArgOptions,
  ): Compiler | null {
    const cwd = process.cwd();
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

    try {
      console.log("rspackConfig----", rspackConfig);
      if (rspackConfig) {
        compiler = rspack(rspackConfig, isWatchEnabled ? afterCallback : undefined);
      }
    }
    catch (e) {
      if (e instanceof ValidationError) {
        logger.error(e.message);
        process.exit(2);
      }
      else if (e instanceof Error) {
        /* if (typeof callback === "function") {
          callback(e);
        } */
        logger.error(e);
      }
      throw e;
    }

    if (compiler && isWatchEnabled) {
      compiler.hooks.watchRun.tapAsync(`${PACKER_NAME} info`, (params, callback) => {
        logger.success(`Success Packer is building your sources...\n`);
        callback();
      });
      compiler.watch({}, afterCallback);
    }
    else if (compiler) {
      compiler.run(() => {
        logger.success(`Success Packer is building your sources..., 服务构建完成.....\n`);
      });
    }
    else {
      logger.error(`Packer is building your sources..., 服务构建失败.....\n`);
    }

    return compiler;
  }
}
