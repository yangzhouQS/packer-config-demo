import { RunActionBuildArgOptions } from "../actions/build.action";
import { RunRsbuildCompilerArgOptions } from "../types/compile.ts";
import { PackerConfigType } from "../types/config";

export abstract class BaseCompiler {
  public abstract run(arg: RunRsbuildCompilerArgOptions): any;
}

export interface RunCompilerArgOptions extends RunActionBuildArgOptions {
  configuration: PackerConfigType;
}
