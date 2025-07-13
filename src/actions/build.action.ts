import process from "node:process";
import { mergeRsbuildConfig, RsbuildConfig } from "@rsbuild/core";
import deepmerge from "deepmerge";
import { Input } from "../commands/command.input";
import { RsbuildCompiler } from "../compiler/rsbuild.compiler.ts";
import { ConfigurationLoader } from "../configuration/configuration.loader";
import { FileSystemReader } from "../configuration/file-system.reader.ts";
import { PACKER_NAME } from "../constants.ts";
import { createContext } from "../create-context.ts";
import { defaultPackerConfig } from "../helpers/default-packer-config";
import { logger } from "../logger.ts";
import { packerPluginDev } from "../plugins/dev.ts";
import { packerPluginHtml } from "../plugins/html.ts";
import { packerPluginOutput } from "../plugins/output.ts";
import { packerPluginResolve } from "../plugins/resolve.ts";
import { packerPluginServer } from "../plugins/server.ts";
import { packerPluginSource } from "../plugins/source.ts";
import { packerWebCommonPlugin } from "../plugins/web-common.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { PackerConfigType } from "../types/config.ts";
import { InternalContext } from "../types/context.ts";
import { AbstractAction } from "./abstract.action";

export interface RunActionBuildArgOptions {
  commandOptions: Input[];
  isWatchEnabled: boolean;
  isDebugEnabled?: boolean;
  pathToTsconfig?: string;
  onSuccess?: () => void;
}

export class BuildAction extends AbstractAction {
  protected readonly fileSystemReader = new FileSystemReader(process.cwd());
  protected readonly loader: ConfigurationLoader = new ConfigurationLoader(
    this.fileSystemReader,
  );

  public async handle(commandOptions: Input[]): Promise<void> {
    logger.debug("------------------BuildAction------------------");
    try {
      const watchModeOption = commandOptions.find(
        option => option.name === "watch",
      );
      // 是否启用 watch
      const isWatchEnabled = !!(watchModeOption && watchModeOption.value);

      await this.runBuild(
        {
          commandOptions,
          isWatchEnabled,
          isDebugEnabled: false,
        },
      );
    }
    catch (error) {
      console.log(error);
    }
  }

  public async runBuild({ commandOptions, isWatchEnabled, isDebugEnabled }: RunActionBuildArgOptions) {
    const configFileName = commandOptions.find(
      option => option.name === "config",
    )!.value as string;

    // 打包配置文件
    let configuration = await this.loader.load(configFileName);
    configuration = deepmerge(defaultPackerConfig, configuration);

    const context = await createContext(configuration, commandOptions);

    const rsbuildConfig = await this.createRsbuildConfig(context, configuration);

    // 解析出站点和服务打包的配置
    logger.debug("--------runBuild-------------configuration");

    const buildParams = {
      configuration,
      rsbuildConfig,
      context,
      extras: {
        inputs: commandOptions,
        watchMode: isWatchEnabled,
        debug: isDebugEnabled,
      },
      tsConfigPath: "tsconfig.json",
    } as RunRsbuildCompilerArgOptions;

    /* 构建站点模块 */
    try {
      logger.info("--------------- rsbuild website module ---------------");
      const rsbuildCompiler = await new RsbuildCompiler();
      await rsbuildCompiler.run(buildParams);
    }
    catch (err) {
      logger.error("Failed to RsbuildCompiler error.");
      logger.error(err);
      process.exit(1);
    }
    finally {
      logger.info("--------------- rsbuild website ------------------- end");
    }
  }

  /**
   * 不支持vue2和vue3同时打包构建
   * @param context
   * @param {PackerConfigType} configuration
   * @returns {Promise<void>}
   */
  async createRsbuildConfig(context: InternalContext, configuration: PackerConfigType): Promise<RsbuildConfig> {
    this.checkBuildVueVersion(configuration);
    return mergeRsbuildConfig(
      await packerWebCommonPlugin(context),
      packerPluginHtml(context),
      packerPluginOutput(context),
      packerPluginSource(context),
      packerPluginResolve(context),
      packerPluginServer(context),
      packerPluginDev(context),
    );
  }

  checkBuildVueVersion(configuration: PackerConfigType) {
    const entries = configuration.entries;
    let isVue2 = false;
    let isVue3 = false;
    for (const entryName in entries) {
      const entry = entries[entryName];
      if (entry.type === "browserVue3") {
        isVue3 = true;
      }
      if (entry.type === "browserVue2") {
        isVue2 = true;
      }
    }
    if (isVue2 && isVue3) {
      logger.error(`[${PACKER_NAME}] 不支持同时打包Vue2和Vue3模块`);
      process.exit(1);
    }
  }
}
