import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRsbuild, RsbuildInstance } from "@rsbuild/core";
import { Input } from "../commands/command.input";
import { createAfterCallback } from "../helpers/process-hook.ts";

import { RunRsbuildCompilerArgOptions } from "../types/compile";
import { BaseCompiler } from "./base.compiler";

interface RsbuildCompilerExtras {
  inputs: Input[];
  debug?: boolean;
  watchMode?: boolean;
}

export class RsbuildCompiler extends BaseCompiler {
  public async run(
    {
      tsConfigPath,
      buildConfig,
      extras,
      context,
      onSuccess,
    }: RunRsbuildCompilerArgOptions,
  ): Promise<RsbuildInstance | undefined> {
    const cwd = process.cwd();
    const configPath = path.join(cwd, tsConfigPath!);
    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Could not find TypeScript configuration file "${tsConfigPath!}".`,
      );
    }

    const watchModeOption = extras.inputs.find(
      option => option.name === "watch",
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    const isBuildWatch = isWatchEnabled && context.action === "build";
    let watch: boolean | undefined;

    const afterCallback = createAfterCallback(onSuccess, isWatchEnabled);
    let rsbuild: RsbuildInstance;
    if (extras.watchMode || watch) {
      rsbuild = await createRsbuild({
        cwd,
        callerName: "webpages-packer-cli",
        rsbuildConfig: buildConfig,
        loadEnv: false,
      });
    }

    rsbuild!.onBeforeCreateCompiler(() => {
    // Skip watching files when not in dev mode or not in build watch mode
      if (rsbuild.context.action !== "dev" && !isBuildWatch) {
        // pass
      }

      // if (isWatchEnabled) {
      //
      // }
    });

    rsbuild!.startDevServer();

    return rsbuild!;
  }
}
