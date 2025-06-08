import type { RspackOptions } from "@rspack/core";
import { RsbuildConfig } from "@rsbuild/core";
import { Input } from "../commands/command.input";
import { PackerConfigType } from "./config";
import { InternalContext } from "./context.ts";

interface RsbuildCompilerExtras {
  inputs: Input[];
  debug?: boolean;
  watchMode?: boolean;
}

export interface RunRsbuildCompilerArgOptions<T = RsbuildCompilerExtras> {
  configuration: PackerConfigType;
  rsbuildConfig?: RsbuildConfig;
  rspackConfig?: RspackOptions; // | MultiRspackOptions;
  context: InternalContext;
  tsConfigPath?: string;
  extras: T;
  onSuccess?: () => void;
}
