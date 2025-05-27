import {BaseCompiler} from "./base.compiler";
import fs from "node:fs"
import path from 'node:path'
import {Input} from "../commands/command.input";
import {RunRsbuildCompilerArgOptions} from "../types/compile";

type RsbuildCompilerExtras = {
  inputs: Input[],
  debug?: boolean;
  watchMode?: boolean;
}

export class RsbuildCompiler extends BaseCompiler {
  public run(
    {
      configuration,
      tsConfigPath,
      extras,
      onSuccess
    }: RunRsbuildCompilerArgOptions
  ): void {
    const cwd = process.cwd();
    const configPath = path.join(cwd, tsConfigPath!);
    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Could not find TypeScript configuration file "${tsConfigPath!}".`,
      );
    }

    const watchModeOption = extras.inputs.find(
      (option) => option.name === 'watch',
    );

    // 是否启用 watch
    const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

    let watch: boolean | undefined;

    // const afterCallback = createAfterCallback(onSuccess);
  }
}
