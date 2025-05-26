// import {RsbuildCompiler} from "../compiler/rsbuild.compiler";
import {Input} from "../commands/command.input";
import {PackerConfigType} from "./config";


type RsbuildCompilerExtras = {
  inputs: Input[],
  debug?: boolean;
  watchMode?: boolean;
}

export interface RunRsbuildCompilerArgOptions<T = RsbuildCompilerExtras> {
  configuration: PackerConfigType,
  tsConfigPath: string,
  extras: T,
  onSuccess?: () => void;
}
