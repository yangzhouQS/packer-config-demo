import path from "node:path";
import { RsbuildConfig } from "@rsbuild/core";
import fse from "fs-extra";
import { paramCase } from "param-case";
import { HTML_CONFIG_FILES } from "../constants.ts";
import { formatEntry } from "../helpers/config.helper.ts";
import { logger } from "../logger.ts";
import { InternalContext } from "../types/context.ts";

/**
 * 解析生成html入口
 * @returns {RsbuildConfig}
 * @param context
 */
export function packerPluginHtml(context: InternalContext): RsbuildConfig {
  logger.debug("开始生成html入口配置");
  const entryConfig = formatEntry(context);

  /* 构建模块标题 */
  const titleMap: Record<string, string> = {};
  /* 每个构建模块模板 */
  const templateMap: Record<string, string> = {};

  entryConfig.webEntries.forEach((entry) => {
    const entryKey = paramCase(entry.entryKey);
    titleMap[entryKey] = entry.title;

    const inputPath = path.join(context.rootPath, entry.input);

    const { dir, name } = path.parse(inputPath);
    const defaultHtmlPath = path.join(dir, `${name}.html`);
    const htmlPath = HTML_CONFIG_FILES.map(h => path.join(dir, h));
    if (!HTML_CONFIG_FILES.includes(`${name}.html`)) {
      htmlPath.unshift(defaultHtmlPath);
    }
    let inputHtml = "";

    // 遍历html文件，找到第一个存在的文件
    for (const hPath of htmlPath) {
      if (fse.existsSync(hPath)) {
        inputHtml = hPath;
        templateMap[entryKey] = inputHtml;
        break;
      }
    }
    if (!inputHtml) {
      logger.warn(`未找到入口[ ${defaultHtmlPath} ] 的html模板，将使用默认模板`);
    }
  });

  return {
    html: {
      mountId: "app",
      title: ({ entryName }: { entryName: string }) => {
        return titleMap[entryName];
      },
      template({ entryName }: { entryName: string }) {
        return templateMap[entryName];
      },
    },
  };
}
