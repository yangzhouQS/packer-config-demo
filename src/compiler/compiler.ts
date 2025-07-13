import process from "node:process";
import { Compiler, MultiStats, rspack, RspackOptions, Stats, ValidationError } from "@rspack/core";
import { logger } from "../logger.ts";

export function createRspackCompiler(options: RspackOptions, callback?: (e: Error | null, res?: Stats | MultiStats) => void) {
  const isWatch = Boolean(options?.watch);
  let compiler: Compiler | null;
  try {
    // compiler = rspack(options, isWatch ? callback : undefined);
    compiler = rspack(options, isWatch ? callback : undefined);
  }
  catch (e) {
    // Aligned with webpack-cli
    // See: https://github.com/webpack/webpack-cli/blob/eea6adf7d34dfbfd3b5b784ece4a4664834f5a6a/packages/webpack-cli/src/webpack-cli.ts#L2394
    if (e instanceof ValidationError) {
      logger.error(e.message);
      process.exit(2);
    }
    else if (e instanceof Error) {
      if (typeof callback === "function") {
        callback(e);
      }
      else {
        logger.error(e);
      }
      return null;
    }
    throw e;
  }
  return compiler;
}
