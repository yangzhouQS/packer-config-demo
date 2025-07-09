import process from "node:process";
import { cac, CAC } from "cac";
import { version } from "../../package.json";
import { ServerBuildAction } from "../actions/server-build.action.ts";
import { ServerStartAction } from "../actions/server-start.action.ts";
import { ServerBuildCommand } from "../commands/server-build.command.ts";
import { ServerStartCommand } from "../commands/server-start.command.ts";
import { PACKER_NAME } from "../constants.ts";
import { color } from "../helpers";
import { logger } from "../logger.ts";

export class PackerServerCli {
  cli: CAC = cac(PACKER_NAME).version(version).help();

  constructor() {
    const landingMessage = `🔥 ${PACKER_NAME} v${version}\n`;
    logger.greet(landingMessage);
  }

  run() {
    this.registerCommands();

    this.cli.parse();
  }

  async registerCommands(): Promise<void> {
    new ServerStartCommand(new ServerStartAction()).load(this);
    new ServerBuildCommand(new ServerBuildAction()).load(this);

    this.handleInvalidCommand();
  }

  private handleInvalidCommand() {
    this.cli.on("command:*", () => {
      console.log("Invalid command: %s", this.cli.args.join(" "));
      console.log(
        `See ${color.red(`--help`)} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}

export type PackerServerCliType = PackerServerCli;
