import { logger } from "@rsbuild/core";
import { Input } from "../commands/command.input.ts";
import { ServerBuildAction } from "./server-build.action.ts";

export class ServerStartAction extends ServerBuildAction {
  public async handle(commandOptions: Input[]) {
    logger.debug("------------------StartAction------------------");

    try {
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
