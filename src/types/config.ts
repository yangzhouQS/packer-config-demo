import { ConfigChainMergeContext } from "./utils.ts";

export type ChainedHtmlOption<O> = ConfigChainMergeContext<O, { entryName: string }>;

export interface VuePackerConfigType {
  resolve: Record<string, any>;
  externals: Record<string, any>;
}

export interface BrowserVue3ConfigType {
  rootOutPath: string;
  packerConfig?: VuePackerConfigType;
}

export interface PackerEntryItemType {
  [key: string]: any;
  entryKey: string;
  type: "browserVue3" | "browserVue2" | "libraryVue3" | "libraryVue2" | "node";
  title: string;
  input: string;
  output?: {
    fileName?: string;
    filePath?: string;
  };
  sourceRoot: string;
}
export interface PackerEntriesType {
  [key: string]: PackerEntryItemType;
}

export interface PackerServerConfigType {
  port?: number;
  staticPath?: string;
  prefix?: string;
  proxy?: Record<string, any>;
  hmr?: boolean;
}

/**
 * 配置文件格式化解析读取
 */
export interface PackerConfigType {
  [key: string]: any;

  /**
   * 配置文件路径
   */
  configFilePath: string;
  global: {
    cwd?: string;
    clear?: string[];
    copy?: Record<string, string>;
    browserVue3?: BrowserVue3ConfigType;
    browserVue2?: BrowserVue3ConfigType;
    libraryVue2?: {
      rootOutPath: string;
    };
    libraryVue3?: {
      rootOutPath: string;
    };
    libraryNode?: {
      rootOutPath: string;
    };
    node?: {
      rootOutPath?: string;
    };
  };
  entries?: PackerEntriesType;

  server?: PackerServerConfigType;
}

export interface EntryOptionType {
  [key: string]: EntryItemType;
}

export interface EntryItemType {
  input: string;
  title?: string;
  output?: {
    fileName?: string;
    filePath?: string;
  };
}

export interface GeneratePackResultType {
  rootPath: string;
  isWebBuild: boolean;
  isServerBuild: boolean;

  webEntries: PackerEntryItemType [];
  nodeEntries: PackerEntryItemType [];
  isVue3: boolean;
  isVue2: boolean;

  [key: string]: any;
}

export type Format = "esm" | "cjs" | "umd" | "mf";

export interface PkgJson {
  name: string;
  type?: "module" | "commonjs";
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}
