import {InternalContext} from "./types/context.ts";
import {Input} from "./commands/command.input.ts";
import {PackerConfigType} from "./types/config.ts";
import {CommandType} from "./types/command.ts";
import {getAbsolutePath} from "./helpers/path.ts";

/**
 * 创建上下文
 * @param {PackerConfigType} configuration
 * @param {Input<CommandType>[]} options
 * @returns {Promise<InternalContext>}
 */
export async function createContext(configuration: PackerConfigType, options: Input<CommandType>[]): Promise<InternalContext> {
  const actionOption = options.find(item => item.name === 'action');
  let action = actionOption?.value ? actionOption.value as CommandType : 'build';
  const rootPath = configuration.global?.cwd ? getAbsolutePath(process.cwd(), configuration.global.cwd) : process.cwd();

  return {
    version: PACKER_VERSION,
    rootPath,
    distPath: '',
    callerName: 'rsbuild',
    action,
    config: configuration,
    commandOptions: options,
  }
}
