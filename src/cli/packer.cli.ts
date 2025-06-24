import process from "node:process";
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

    this.checkNodeVersion();
  }

  run() {
    this.registerCommands();

    this.cli.parse();
  }

  async registerCommands(): Promise<void> {
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

  private checkNodeVersion() {
    const nodeVersion = process.versions.node;
    const versionArr = nodeVersion.split(".").map(Number);

    if (versionArr[0] < 16) {
      console.warn(`
${color.bgRed(color.white(" ⚠️ CRITICAL NODE.JS VERSION ALERT ⚠️ "))}
    ${color.red("Node.js 16 End-of-Life Notice:")}
    ${color.underline(color.red("June 30, 2025"))} ${color.red("- Security updates and support will cease")}
    
    ${color.yellow("▸ Detected Runtime:")}  ${color.yellow(color.bold(`Node.js v${nodeVersion}`))}
    ${color.green("▸ Required Minimum:")} ${color.green(color.bold("Node.js LTS (v18.x or higher)"))}
    ${color.green("▸ Recommended:")} ${color.green(color.bold("Node.js LTS (v22.x or higher)"))}

  ${color.cyan("Immediate Action Required:")}
    ${color.gray("├──")} ${color.yellow("Recommended Upgrade")}
       ${color.bold("nvm install 22 --lts && nvm use 22")}
    ${color.gray("├──")} ${color.yellow("Manual Installation")}
       ${color.underline("https://nodejs.org/download/release/lts-hydrogen/")}
     ${color.gray("└──")} ${color.yellow("Environment Verification")}
       ${color.bold("node -v && npm -v")}

  ${color.italic(color.whiteBright("[Security Advisory] Production environments must update before 2025-06-30"))}
`,
      );
    }
  }
}
