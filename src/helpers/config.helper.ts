import {GeneratePackResultType, PackerConfigType, PackerEntryItemType} from "../types/config.ts";
import $lodash from "../../compiled/lodash";
import {logger, mergeRsbuildConfig} from "@rsbuild/core";
import {getEnvDir} from "./process-hook.ts";
import path from "node:path";
import {paramCase} from "param-case";
import {merge as webpackMerge} from "webpack-merge";
import {Input} from "../commands/command.input.ts";
import deepmerge from "deepmerge";
import {PACKER_NAME} from "../constants.ts";
import {
  DEFAULT_PACK_CONFIG,
  DEFAULT_RSBUILD_CONFIG,
  DEFAULT_RSPACK_CONFIG, defaultWebOutputConfig,
  defaultWebServeConfig
} from "./default.config.ts";


export function generatePackBuildConfig(
  {packConfig, commandOptions, isWatchEnabled}:
  { packConfig: PackerConfigType; commandOptions: Input[], isWatchEnabled: boolean }
) {
  /*const serverConfig = {
    entry: {
      main: './src/controllers/main.ts',
    },
    output: {
      path: '',
      filename: '[name].js',
    },
  };*/

  const env = commandOptions.find((opt) => opt.name === 'env')?.value;
  const include = commandOptions.find((opt) => opt.name === 'include')?.value;
  const isProduction = env === 'production';
  const configResult: GeneratePackResultType = {
    rootPath: '',
    webConfig: {},
    serverConfig: {},
    isWebBuild: false,
    isServerBuild: true,
    _privateMeta: {},
  };
  const config = deepmerge(DEFAULT_PACK_CONFIG, packConfig);
  const global = $lodash.get(config, 'global');
  const server = $lodash.get(config, 'server', {});
  const root = $lodash.get(config, 'cwd', process.cwd());
  configResult.rootPath = root;
  const nodeOutputPath = $lodash.get(global, 'node.rootOutPath', 'dist');
  const entries = $lodash.get(config, 'entries', {});
  const webEntries: PackerEntryItemType[] = [];
  const nodeEntries: PackerEntryItemType[] = [];

  /*构建模块入口*/
  const sourceEntries: Record<string, string> = {};
  /*构建模块标题*/
  const titleMap: Record<string, string> = {};
  /*每个构建模块模板*/
  const templateMap: Record<string, string> = {};

  $lodash.forEach(entries, (entry: PackerEntryItemType, key: string) => {
    if (!['browserVue3', 'browserVue2', 'node'].includes(entry.type)) {
      logger.error(`[${PACKER_NAME}] 打包类型${entry.type}暂不支持, 请检查 entries.${key}模块打包配置`);
      process.exit(1);
    }

    entry._entryKey = key;

    if (entry.type === 'node') {
      nodeEntries.push(entry);
      configResult.isServerBuild = true;
    }

    if (entry.type === 'browserVue3' || entry.type === 'browserVue2') {
      webEntries.push(entry);
      configResult.isWebBuild = true;
    }
  });

  let includes: string[] = [];
  if (include) {
    includes = `${include}`.split(',');
  }

  // build  production entry
  if (isProduction) {
    includes = includes.concat(Object.keys(entries));
  }

  /*1.模块打包入口和输入目录配置*/
  for (const entry of webEntries) {
    const entryName = entry._entryKey;
    if (!includes.includes(entryName) && !isProduction) {
      break;
    }
    if (!entry || !entry.input) {
      logger.error(`${PACKER_NAME} entry ${entryName} is not valid, please check your packer.config file`);
      process.exit(1);
    }
    const inputPath = getEnvDir(root, entry.input);
    const {dir, name} = path.parse(inputPath);
    const parseCaseEntryName = paramCase(entryName);
    if (includes.includes(entryName)) {
      titleMap[parseCaseEntryName] = entry.title || entryName;
      sourceEntries[parseCaseEntryName] = inputPath;
      templateMap[parseCaseEntryName] = path.join(dir, paramCase(name || entryName) + '.html');
    }
  }

  /*2.本地代理服务器配置*/
  const serverConfigProxy = deepmerge(defaultWebServeConfig, {
    base: $lodash.get(server, 'prefix', ''),
    host: $lodash.get(server, 'host', undefined),
    port: $lodash.get(server, 'port', ''),
    proxy: $lodash.get(server, 'proxy', null),
    // middlewareMode: true
  });

  if (server.proxy) {
    serverConfigProxy.proxy = server.proxy; // mergeDeep(serverConfigProxy.proxy, );
  }


  /*3.拷贝文件*/
  const _copy: { from: string; to: string; }[] = []; //typeof packerConfig.global.copy === 'object'? outputConfig.copy : [];
  const copy = global?.copy || {};
  Object.keys(copy).forEach((key) => {
    _copy.push({
      from: key,
      to: path.resolve(root, copy[key]),
    });
  });

  /*4.output 配置*/
  const outputConfig = deepmerge(
    defaultWebOutputConfig,
    {
      copy: _copy,
      externals: $lodash.get(global, 'browserVue3.packerConfig.externals', {}),
    },
  );

  /*resolveConfig*/
  const resolveConfig = {
    alias: $lodash.get(global, 'browserVue3.packerConfig.resolve.alias', {}),
    extensions: $lodash.get(global, 'browserVue3.packerConfig.resolve.extensions', {}),
  };

  const rsBuildWebConfig = {
    dev: {
      hmr: false, // get(server, 'hmr', true),
    },
    resolve: resolveConfig,
    output: outputConfig,
    source: {
      entry: sourceEntries,
    },
    html: {
      title: ({entryName}: { entryName: string }) => {
        return titleMap[entryName] || entryName;
      },
      mountId: 'app',
      template({entryName}: { entryName: string }) {
        return templateMap[entryName];
      },
    },
    server: serverConfigProxy,
  };

  configResult.webConfig = mergeRsbuildConfig(DEFAULT_RSBUILD_CONFIG, rsBuildWebConfig as any);

  if (nodeEntries.length > 0) {
    const entry = nodeEntries[0];
    const nodeEntry: Record<string, any> = {};

    /*服务启用了打包*/
    if (includes.includes(entry._entryKey)) {
      let entryOutputFileName = $lodash.get(entry, 'output.fileName', paramCase(entry._entryKey));
      let entryOutputPath = '';

      if (!entryOutputFileName.endsWith('.js')) {
        entryOutputFileName += '.js';
      }

      const filePath = $lodash.get(entry, 'output.filePath');
      configResult._privateMeta.serverEntry = entry._entryKey;

      if (filePath) {
        entryOutputPath = path.resolve(root, filePath);
      } else {
        entryOutputPath = path.resolve(root, nodeOutputPath);
      }

      // 模块入口
      nodeEntry[entry._entryKey] = getEnvDir(root, entry.input);


      const rspackConfig = {
        watch: isWatchEnabled || false,
        context: root,
        entry: nodeEntry,
        output: {
          path: entryOutputPath,
          filename: entryOutputFileName,
        },
      } as any;

      configResult.serverConfig = webpackMerge(DEFAULT_RSPACK_CONFIG, rspackConfig);
    }
  }

  return configResult;
}
