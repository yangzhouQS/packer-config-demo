import {PackerConfigType} from "./config.ts";
import {Input} from "../commands/command.input.ts";

export type PackerContext = {
  /** The Packer version. */
  version: string;
  /** The root path of current project. */
  rootPath: string;
  /** Absolute path of output files. */
  distPath: string;
  /**
   * The current action type.
   * - dev: will be set when running `rsbuild dev` or `rsbuild.startDevServer()`
   * - build: will be set when running `rsbuild build` or `rsbuild.build()`
   * - preview: will be set when running `rsbuild preview` or `rsbuild.preview()`
   */
  action: 'dev' | 'build' | 'preview';

  /**
   * The name of the framework or tool that is currently invoking Rsbuild,
   * same as the `callerName` option in the `createRsbuild` method.
   * @example
   * - `rslib` is set when Rslib calls Rsbuild.
   * - `rspress` is set when Rspress calls Rsbuild.
   */
  callerName?: string;
}

/** The inner context. */
export type InternalContext = PackerContext & {
  /** Current PackerConfigType config. */
  config: Readonly<PackerConfigType>;

  /**
   * 命令行参数数组
   */
  commandOptions: Input[];
}
