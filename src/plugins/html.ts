import {RsbuildConfig} from "@rsbuild/core";
import {PackerConfigType} from "../types/config.ts";
import {logger} from "../logger.ts";

/**
 * 解析生成html入口
 * @param {PackerConfigType} configuration
 * @returns {RsbuildConfig}
 */
export const pluginHtml = (configuration: PackerConfigType): RsbuildConfig => {
  logger.info("开始生成html入口");
  console.log(configuration);
  return {
    html: {
      mountId: 'app',
      title: ({entryName}: { entryName: string }) => {

      },
      template({entryName}: { entryName: string }) {

      }
    },
  }
}
