import { parse, resolve } from "node:path";

// import { copySync, existsSync, mkdirsSync, removeSync } from "fs-extra";
import fse from "fs-extra";
import { logger } from "../logger.ts";

export function copyFiles(option: Record<string, any>, cwd: string) {
  for (const key in option) {
    if (Object.prototype.hasOwnProperty.call(option, key)) {
      const inputPath = key;
      const outPath = option[key];
      const copyPath = resolve(cwd, inputPath);
      const targetPath = resolve(cwd, outPath);
      if (fse.existsSync(copyPath)) {
        fse.mkdirsSync(parse(targetPath).dir);
        fse.copySync(copyPath, targetPath);
        logger.success(`文件：[${inputPath}] \n从路径：[${copyPath}] \n拷贝到目标路径：[${targetPath}]拷贝完成!`);
      }
      else {
        logger.warn(`文件： [${inputPath}] 在[${copyPath}]没有找到!`);
      }
    }
  }
}

export function clearFiles(option: Record<string, any>, cwd: string) {
  for (let index = 0; index < option.length; index++) {
    const clearPath = resolve(cwd, option[index]);
    if (fse.existsSync(clearPath)) {
      fse.removeSync(clearPath);
      logger.success(`在路径：[${clearPath}]的文件清除完成!`);
    }
  }
}
