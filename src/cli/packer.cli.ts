import { cac, CAC } from "cac";
import { version } from "../../package.json";
import { BuildAction } from "../actions/build.action.ts";
import { StartAction } from "../actions/start.action.ts";
import { BuildCommand } from "../commands/build.command.ts";
import { StartCommand } from "../commands/start.command.ts";
import { PACKER_NAME } from "../constants.ts";
import { color } from "../helpers";
import { logger } from "../logger.ts";

export class PackerCli {
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
    console.log("----------registerCommands------------");
    new StartCommand(new StartAction()).load(this);
    new BuildCommand(new BuildAction()).load(this);

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
