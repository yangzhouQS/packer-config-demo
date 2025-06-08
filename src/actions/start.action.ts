import { logger } from "@rsbuild/core";
import { Input } from "../commands/command.input.ts";
import { BuildAction } from "./build.action.ts";

export class StartAction extends BuildAction {
  public async handle(commandOptions: Input[]) {
    console.log("------------------StartAction------------------");

    try {
      /* const configFileName = commandOptions.find(
        (option) => option.name === 'config',
      )!.value as string;
      const configuration = await this.loader.load(configFileName); */

      const debugModeOption = commandOptions.find(
        option => option.name === "debug",
      );
      const watchModeOption = commandOptions.find(
        option => option.name === "watch",
      );

      // 是否启用 watch
      const isWatchEnabled = !!(watchModeOption && watchModeOption.value);
      // 是否启用 debug 模式，即是否启用 参数 --inspect
      const isDebugEnabled = !!(debugModeOption && debugModeOption.value);

      // console.log('configFileName = ', configFileName);
      // console.log('configuration = ', configuration);

      const onSuccess = () => {
        console.log("dev --- onSuccess");
      };
      await this.runBuild(
        {
          commandOptions,
          isWatchEnabled,
          isDebugEnabled,
          onSuccess,
        },
      );
    }
    catch (error) {
      logger.error("[startAction dev] Failed to start dev server.");
      logger.error(error);
    }
  }
}
