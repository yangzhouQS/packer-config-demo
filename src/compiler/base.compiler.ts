import {PackerConfigType} from "../types/config";
import {RunActionBuildArgOptions} from "../actions/build.action";
import {RunRsbuildCompilerArgOptions} from "../types/compile.ts";

export abstract class BaseCompiler {
  public abstract run(arg: RunRsbuildCompilerArgOptions): void;
}


export interface RunCompilerArgOptions extends RunActionBuildArgOptions {
  configuration: PackerConfigType;
}
