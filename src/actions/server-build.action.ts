import path from "node:path";
import process from "node:process";
import deepmerge from "deepmerge";
import { Input } from "../commands/command.input";
import { RspackCompiler } from "../compiler/rspack.compiler.ts";
import { ConfigurationLoader } from "../configuration/configuration.loader";
import { FileSystemReader } from "../configuration/file-system.reader.ts";
import { RSPACK_BUILD_ERROR } from "../constants.ts";
import { createContext } from "../create-context.ts";
import { formatEntry } from "../helpers/config.helper.ts";
import { defaultPackerConfig } from "../helpers/default-packer-config";
import { createOnSuccessHook } from "../helpers/process-hook.ts";
import { logger } from "../logger.ts";
import { packerServicePlugin } from "../plugins/node-service.ts";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { InternalContext } from "../types/context.ts";
import { AbstractAction } from "./abstract.action";

export interface RunActionBuildArgOptions {
  commandOptions: Input[];
  isWatchEnabled: boolean;
  isDebugEnabled?: boolean;
  pathToTsconfig?: string;
  onSuccess?: () => void;
}

export class ServerBuildAction extends AbstractAction {
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
    const rspackConfig = await this.createRspackConfig(context);

    // 解析出站点和服务打包的配置
    logger.debug("--------runBuild-------------configuration");

    const onSuccess = this.createBuildCallback(context);

    const buildParams = {
      configuration,
      rspackConfig,
      context,
      extras: {
        inputs: commandOptions,
        watchMode: isWatchEnabled,
        debug: isDebugEnabled,
      },
      tsConfigPath: "tsconfig.json",
      onSuccess,
    } as RunRsbuildCompilerArgOptions;

    /* 构建服务模块 */
    try {
      const rsPackCompiler = new RspackCompiler();
      await rsPackCompiler.run(buildParams);
    }
    catch (err) {
      const isRspackError = err instanceof Error && err.message === RSPACK_BUILD_ERROR;
      if (!isRspackError) {
        logger.error(`[commands ${context.action}] Failed to build.`);
      }
      logger.error(err);
      process.exit(1);
    }
    finally {
      logger.info("--------------- build server --------------- end");
    }
  }

  /**
   * 创建服务打包配置
   * @param {InternalContext} context
   * @returns {Promise<void>}
   */
  async createRspackConfig(context: InternalContext) {
    return packerServicePlugin(context);
  }

  createBuildCallback(context: InternalContext) {
    const { isServerBuild, nodeEntries } = formatEntry(context);
    if (!isServerBuild || context.action === "build") {
      return () => {};
    }

    const entry = nodeEntries[0];
    const outputPath = path.join(entry.output?.filePath || "", entry.output?.fileName || "");

    /*
    * {
        input: 'src/controllers/main.ts',
        title: 'server',
        type: 'node',
        entryKey: 'server',
        sourceRoot: 'H:\\2026code\\demo\\doc-rspack\\packer-config-demo\\examples\\node-pm-inner-metadata-system\\src\\controllers',
        entryFile: 'main.ts',
        output: { fileName: 'main.js', filePath: 'dist/controllers' }
      }
    * */
    return createOnSuccessHook(
      entry.input, // "controllers/main",
      context.rootPath, // "src",
      true,
      outputPath,
      // context.distPath || "dist", // "dist", // path.join(context.rootPath, "dist"),
      "node",
      {
        shell: false,
      },
    );
  }
}
