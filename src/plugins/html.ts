import {RsbuildConfig} from "@rsbuild/core";
import {logger} from "../logger.ts";
import {InternalContext} from "../types/context.ts";
import {formatEntry} from "../helpers/config.helper.ts";
import {forEach} from "lodash";
import path from "node:path";
import {HTML_CONFIG_FILES} from "../constants.ts";
import $lodash from "../../compiled/lodash";
import fse from 'fs-extra';
import {paramCase} from 'param-case';

/**
 * 解析生成html入口
 * @returns {RsbuildConfig}
 * @param context
 */
export const PackerPluginHtml = (context: InternalContext, ): RsbuildConfig => {
  logger.info("开始生成html入口");
  console.log(context);
  const {config} = context;
  const entries = config.entries || {};
  const entryConfig = formatEntry(context);

  /*构建模块标题*/
  const titleMap: Record<string, string> = {};
  /*每个构建模块模板*/
  const templateMap: Record<string, string> = {};

  forEach(entryConfig.webEntries, (entry) => {
    console.log(`inputHtml----${entry.title}`);
    const entryKey = paramCase(entry.entryKey);
    titleMap[entryKey] = entry.title;

    const inputPath = path.join(context.rootPath, entry.input);

    const {dir,name} = path.parse(inputPath);
    const defaultHtmlPath = path.join(dir, name + '.html');
    let htmlPath = HTML_CONFIG_FILES.map(h => path.join(dir, h));
    htmlPath.unshift(defaultHtmlPath);
    htmlPath = $lodash.uniq(htmlPath);
    let inputHtml = '';

    // 遍历html文件，找到第一个存在的文件
    for (const hPath of htmlPath) {
      if (fse.existsSync(hPath)){
        inputHtml = hPath;
        templateMap[entryKey] = inputHtml;
        break;
      }
    }
    if (!inputHtml){
      logger.warn(`未找到入口[ ${defaultHtmlPath} ] 的html模板，将使用默认模板`);
    }

  })

  return {
    html: {
      mountId: 'app',
      title: ({entryName}: { entryName: string }) => {
        return titleMap[entryName];
      },
      template({entryName}: { entryName: string }) {
        return templateMap[entryName];
      }
    },
  }
}
