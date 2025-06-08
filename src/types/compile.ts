import { RsbuildConfig } from "@rsbuild/core";
// import {RsbuildCompiler} from "../compiler/rsbuild.compiler";
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
  buildConfig: RsbuildConfig | (() => Promise<RsbuildConfig>);
  context: InternalContext;
  tsConfigPath?: string;
  extras: T;
  onSuccess?: () => void;
}
