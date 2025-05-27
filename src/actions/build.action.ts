import {AbstractAction} from "./abstract.action";
import {Input} from "../commands/command.input";
import {FileSystemReader} from "../configuration/file-system.reader.ts";
import {ConfigurationLoader} from "../configuration/configuration.loader";
import {RsbuildCompiler} from "../compiler/rsbuild.compiler";
import deepmerge from "deepmerge";
import {defaultPackerConfig} from "../helpers/default-packer-config";
import {packerPluginHtml} from "../plugins/html.ts";
import {PackerConfigType} from "../types/config.ts";
import {PACKER_NAME} from "../constants.ts";
import {logger} from "../logger.ts";
import {createContext} from "../createContext.ts";
import {mergeRsbuildConfig} from "@rsbuild/core";
import {packerPluginOutput} from "../plugins/output.ts";
import {packerCommonPlugin} from "../plugins/common.ts";
import {packerPluginSource} from "../plugins/source.ts";
import {packerPluginResolve} from "../plugins/resolve.ts";


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

    // const resultConfig = await generatePackBuildConfig({packConfig: configuration, commandOptions, isWatchEnabled})
    // console.log(resultConfig);

    await this.createRsbuildConfig(configuration, commandOptions);


    // 解析出站点和服务打包的配置
    // console.log('--------runBuild-------------configuration');
    // console.log(configuration);

    const rsbuildCompiler = new RsbuildCompiler();
    rsbuildCompiler.run({
      configuration,
      extras: {
        inputs: commandOptions,
        watchMode: isWatchEnabled,
        debug: isDebugEnabled
      },
      tsConfigPath: 'tsconfig.json',
      onSuccess,
    })
  }

  /**
   * 不支持vue2和vue3同时打包构建
   * @param {PackerConfigType} configuration
   * @returns {Promise<void>}
   */
  async createRsbuildConfig(configuration: PackerConfigType,options: Input[]) {
    const context = await createContext(configuration,options);
    this.checkBuildVueVersion(configuration);
    const rsConfig = mergeRsbuildConfig(
      await packerCommonPlugin(context),
      packerPluginHtml(context),
      packerPluginOutput(context),
      packerPluginSource(context),
      packerPluginResolve(context),
    )
    // console.log(rsConfig);
  }

  checkBuildVueVersion(configuration: PackerConfigType) {
    const entries = configuration.entries;
    let isVue2 = false;
    let isVue3 = false;
    for (const entryName in entries) {
      const entry = entries[entryName];
      if (entry.type === 'browserVue3') {
        isVue3 = true;
      }
      if (entry.type === 'browserVue2') {
        isVue2 = true;
      }
    }
    if (isVue2 && isVue3) {
      logger.error(`[${PACKER_NAME}] 不支持同时打包Vue2和Vue3模块`);
      process.exit(1);
    }
  }
}
