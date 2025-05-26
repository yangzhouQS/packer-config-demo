import {AbstractCommand} from "./abstract.command";
import {CommandTypeOptions} from "../types/command";
import {setNodeEnv} from "../helpers";
import {PackerCli} from "../cli/packer.cli.ts";


export class BuildCommand extends AbstractCommand {
  public load(packerCli: PackerCli): void {
    packerCli.cli
      .command('build', 'build project')
      .action(async (command: CommandTypeOptions) => {
        setNodeEnv(command.env)
        console.log('----------------------BuildCommand----------------------');
        process.env.NODE_ENV = command.env;
        console.log('build options', command);
      });
  }
}
