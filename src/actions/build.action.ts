import {AbstractAction} from "./abstract.action";
import {Input} from "../commands/command.input";
import {FileSystemReader} from "../configuration/file-system.reader.ts";
import {ConfigurationLoader} from "../configuration/configuration.loader";
import {RsbuildCompiler} from "../compiler/rsbuild.compiler";
import deepmerge from "deepmerge";
import {defaultPackerConfig} from "../helpers/default-packer-config";
import {generatePackBuildConfig} from "../helpers/config.helper.ts";

export interface RunActionBuildArgOptions {
  commandOptions: Input[]
  isWatchEnabled: boolean
  isDebugEnabled?: boolean
  pathToTsconfig?: string;
  onSuccess?: () => void
}

export class BuildAction extends AbstractAction {
  protected readonly fileSystemReader = new FileSystemReader(process.cwd());
  protected readonly loader: ConfigurationLoader = new ConfigurationLoader(
    this.fileSystemReader,
  );

  public async handle(commandOptions: Input[]): Promise<void> {

    try {
      const watchModeOption = commandOptions.find(
        (option) => option.name === 'watch',
      );
      const watchMode = !!(watchModeOption && watchModeOption.value);
    } catch (error) {
      console.log(error);
    }
  }

  public async runBuild({commandOptions, isWatchEnabled, isDebugEnabled, onSuccess}: RunActionBuildArgOptions) {
    const configFileName = commandOptions.find(
      (option) => option.name === 'config',
    )!.value as string;

    // 打包配置文件
    let configuration = await this.loader.load(configFileName);
    configuration = deepmerge(defaultPackerConfig, configuration);

    const resultConfig = await generatePackBuildConfig({packConfig: configuration, commandOptions, isWatchEnabled})
    console.log(resultConfig);


    // 解析出站点和服务打包的配置
    console.log('--------runBuild-------------configuration');
    console.log(configuration);

    // const rsbuildCompiler = new RsbuildCompiler();

    // rsbuildCompiler.run(configuration)
  }
}
