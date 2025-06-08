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

export function formatEntry(context: InternalContext) {
  const { config } = context;
  const entries = get(config, "entries", {});
  let isVue3 = false;
  let isVue2 = false;
  const configResult: GeneratePackResultType = {
    rootPath: "",
    webConfig: {},
    serverConfig: {},
    isWebBuild: false,
    isServerBuild: true,
    _privateMeta: {},
  };

  const webEntries: PackerEntryItemType[] = [];
  const nodeEntries: PackerEntryItemType[] = [];
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

    if (entry.type === "node") {
      nodeEntries.push(entryConfig);
      configResult.isServerBuild = true;
    }

    if (["browserVue3", "browserVue2"].includes(entry.type)) {
      webEntries.push(entryConfig);
      configResult.isWebBuild = true;
    }

    // 判断vue版本，后续使用
    if (entry.type === "browserVue3") {
      isVue3 = true;
    }
    if (entry.type === "browserVue2") {
      isVue2 = true;
    }
  });
  return {
    webEntries,
    nodeEntries,
    isVue3,
    isVue2,
  };
}
