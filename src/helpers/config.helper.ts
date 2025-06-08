import process from "node:process";
import get from "lodash.get";
import { logger } from "../logger.ts";
import { GeneratePackResultType, PackerEntryItemType } from "../types/config.ts";
import { InternalContext } from "../types/context.ts";

/**
 * 获取命令行参数中 --include 参数值，并以逗号分隔的字符串形式返回。
 * @param {InternalContext} context
 * @returns {any}
 */
export function formatCommandInclude(context: InternalContext): string[] {
  const includeOption = context.commandOptions.find(item => item.name === "include");
  if (includeOption && includeOption.value) {
    return includeOption?.value.split(",");
  }
  return [];
}

const entryFormatMap = new Map<number, GeneratePackResultType>();

/**
 * 格式化entry配置
 * @param {InternalContext} context
 * @returns {{nodeEntries: PackerEntryItemType[], isVue2: boolean, webEntries: PackerEntryItemType[], isVue3: boolean}}
 */
export function formatEntry(context: InternalContext): GeneratePackResultType {
  const { config, uuid, commandOptions } = context;

  const entries = get(config, "entries", {});

  const includeStr = commandOptions.find(item => item.name === "include");
  let buildIncludes: string[] = [];
  if (context.action === "dev") {
    if (includeStr && includeStr.value) {
      buildIncludes.push(...includeStr.value.split(","));
    }
  }
  if (context.action === "build") {
    buildIncludes = Object.keys(entries) as string[];
  }

  // 判断是否已经格式化过，如果已经格式化过，则直接返回
  if (entryFormatMap.has(uuid)) {
    return entryFormatMap.get(uuid) as GeneratePackResultType;
  }

  const configResult: GeneratePackResultType = {
    rootPath: context.rootPath,
    isWebBuild: false,
    isServerBuild: false,
    webEntries: [],
    nodeEntries: [],
    _privateMeta: {},
    isVue3: false,
    isVue2: false,
  };

  Object.entries(entries).forEach(([key, entry]: [string, PackerEntryItemType]) => {
    const entryConfig = {
      input: entry.input,
      title: entry.title || key,
      type: entry.type,
      entryKey: key,
    };

    if (!["browserVue3", "browserVue2", "node"].includes(entry.type)) {
      logger.error(`[${PACKER_NAME}] 打包类型${entry.type}暂不支持, 请检查 entries.${key}模块打包配置`);
      process.exit(1);
    }

    if (entry.type === "node" && buildIncludes.includes(key)) {
      if (typeof entry.output === "object") {
        const fileName = entry.output?.fileName || "main.js";
        const filePath = entry.output?.filePath || "dist";
        entry.output = {
          fileName,
          filePath,
        };
      }
      else {
        entry.output = {
          fileName: "main.js",
          filePath: "dist",
        };
      }
      Object.assign(entryConfig, { output: entry.output });
      configResult.nodeEntries.push(entryConfig);
      configResult.isServerBuild = true;
    }

    if (["browserVue3", "browserVue2"].includes(entry.type) && buildIncludes.includes(key)) {
      configResult.webEntries.push(entryConfig);
      configResult.isWebBuild = true;

      // 判断vue版本，后续使用
      if (entry.type === "browserVue3") {
        configResult.isVue3 = true;
      }
      if (entry.type === "browserVue2") {
        configResult.isVue2 = true;
      }
    }
  });

  entryFormatMap.set(uuid, configResult);

  return configResult;
}
