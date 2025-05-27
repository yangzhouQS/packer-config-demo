import {RsbuildConfig} from "@rsbuild/core";
import {InternalContext} from "../types/context.ts";
import {formatCommandInclude, formatEntry} from "../helpers/config.helper.ts";
import {logger} from "../logger.ts";
import {paramCase} from "param-case";
import path from "node:path";


export function packerPluginSource(context: InternalContext,): RsbuildConfig {
  logger.debug('--------packerPluginSource----------');
  const includes = formatCommandInclude(context);

  const {webEntries} = formatEntry(context);
  const entryConfig: Record<string, string> = {};
  for (const entry of webEntries) {
    // 需要启动的模块
    if (includes.includes(entry.entryKey)) {
      entryConfig[paramCase(entry.entryKey)] = path.resolve(context.rootPath, entry.input);
    }

    // build 打包所有的模块
    if (context.action === 'build') {
      entryConfig[paramCase(entry.entryKey)] = path.resolve(context.rootPath, entry.input);
    }
  }

  return {
    source:{
      decorators: {
        version: 'legacy',
      },
      entry: entryConfig,
    }
  };
}
