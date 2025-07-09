import process from "node:process";
import { PackerServerCliType } from "../cli/packer-server.cli.ts";
import { setNodeEnv } from "../helpers";
import { logger } from "../logger.ts";
import { CommandTypeOptions } from "../types/command";
import { AbstractCommand } from "./abstract.command";
import { Input } from "./command.input.ts";

export class ServerBuildCommand extends AbstractCommand {
  public load(packerCli: PackerServerCliType): void {
    packerCli.cli.command("build", "build project")
      .option("-c, --config [path]", "Path to configuration file; e.g. ./packer-config.js")
      .option("-w, --watch", "Run in watch mode (live-reload).", { default: false })
      // .option("-inc, --include [moduleName]", "local build modules to include; e.g. --include flowDesign,flowForm", { default: "" })
      .option(
        "--env <env>",
        "Sets process.env.NODE_ENV to the specified value for access within the configuration.",
        {
          default: "production",
        },
      )
      .option("-p, --path [path]", "Path to tsconfig file.")
      .action(async (command: CommandTypeOptions) => {
        setNodeEnv(command.env);
        const options: Input[] = [];
        logger.debug("----------------------BuildCommand----------------------");

        options.push({ name: "action", value: "build" });
        options.push({ name: "config", value: command.config });
        options.push({ name: "watch", value: !!command.watch });
        options.push({ name: "env", value: command.env });
        options.push({ name: "path", value: command.path });

        logger.debug("Build packer server", command);
        try {
          await this.action.handle(options);
        }
        catch (err) {
          logger.log(err);
          process.exit(1);
        }
      });
  }
}
