import {AbstractCommand} from "./abstract.command";
import {CommandTypeOptions} from "../types/command";
import {setNodeEnv} from "../helpers";
import {PackerCli} from "../cli/packer.cli.ts";
import {Input} from "./command.input.ts";


export class BuildCommand extends AbstractCommand {
  public load(packerCli: PackerCli): void {
    packerCli.cli
      .command('build', 'build project')
      .action(async (command: CommandTypeOptions) => {
        setNodeEnv(command.env)
        const options: Input[] = [];
        console.log('----------------------BuildCommand----------------------');
        options.push({name: 'action', value: 'build'});

        process.env.NODE_ENV = command.env;
        console.log('build options', command);
      });
  }
}
