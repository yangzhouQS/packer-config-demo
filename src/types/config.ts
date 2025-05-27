import {RsbuildConfig} from "@rsbuild/core";
import {RspackOptions} from "@rspack/core";
import {ConfigChainMergeContext} from "./utils.ts";
export type ChainedHtmlOption<O> = ConfigChainMergeContext<O, { entryName: string }>;

export type VuePackerConfigType = {
  resolve: Record<string, any>,
  externals: Record<string, any>,
};


export type BrowserVue3ConfigType = {
  rootOutPath: string,
  packerConfig?: VuePackerConfigType
};

export type PackerEntryItemType = {
  [key: string]: any,
  entryKey: string,
  type: 'browserVue3' | 'browserVue2' | 'libraryVue3' | 'libraryVue2' | 'node',
  title: string,
  input: string,
  output?: {
    fileName?: string,
    filePath?: string,
  },
};
export type PackerEntriesType = {
  [key: string]: PackerEntryItemType
};

export type PackerServerConfigType = {
  port?: number,
  staticPath?: string,
  prefix?: string,
  proxy?: Record<string, any>,
  hmr?: boolean,
};

export type PackerConfigType = {
  [key: string]: any,
  global: {
    cwd?: string;
    clear?: string[],
    copy?: Record<string, string>,
    browserVue3?: BrowserVue3ConfigType,
    browserVue2?: BrowserVue3ConfigType,
    libraryVue2?: {
      rootOutPath: string,
    },
    libraryVue3?: {
      rootOutPath: string,
    },
    libraryNode?: {
      rootOutPath: string,
    },
    node?: {
      rootOutPath?: string,
    }
  },
  entries?: PackerEntriesType,

  server?: PackerServerConfigType
}

export type EntryOptionType = {
  [key: string]: EntryItemType
};

export type EntryItemType = {
  input: string;
  title?: string;
  output?: {
    fileName?: string,
    filePath?: string,
  }
};


export type GeneratePackResultType = {
  webConfig: RsbuildConfig;
  serverConfig: RspackOptions;
  isWebBuild: boolean;
  isServerBuild: boolean;
  rootPath: string;
  [key: string]: any;
};
