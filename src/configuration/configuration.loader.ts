import {PackerConfigType} from "../types/config";
import {Reader, ReaderFileLackPermissionsError} from "./reader";
import {PACKER_CONFIG_FILES} from "../constants";
import {logger} from "../logger";
import {__dirname} from '../constants'

const loadedConfigsCache = new Map<string, Required<PackerConfigType>>();

export class ConfigurationLoader {
  constructor(private readonly reader: Reader) {
  }

  /**
   * 需要读取的配置文件的真是路径
   * @param {string} name
   * @returns {Required<PackerConfigType>}
   */
  async load(name?: string): Promise<PackerConfigType> {
    const cacheEntryKey = `${this.reader.constructor.name}:${name}`;
    const cachedConfig = loadedConfigsCache.get(cacheEntryKey);
    if (cachedConfig) {
      return cachedConfig;
    }
    let loadedConfig: PackerConfigType;

    const contentOrError = name
      ? this.reader.read(name)
      : this.reader.readAnyOf(PACKER_CONFIG_FILES);

    // 如果读取成功, 使用jiti解析读取
    if (contentOrError){
      const isMissingPermissionsError = contentOrError instanceof ReaderFileLackPermissionsError;
      if (isMissingPermissionsError) {
        console.error(contentOrError.message);
        process.exit(1);
      }

      if (contentOrError?.fileName){
        loadedConfig = await this.reader.parse<PackerConfigType>(contentOrError.fileName);
      }
    } else {
      logger.error(`No configuration file found in ${__dirname} read packer-config.js`);
      process.exit(1);
    }

    return loadedConfig!;
  }
}
