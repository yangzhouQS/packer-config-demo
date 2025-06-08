import { PackerConfigType } from "../types/config";

/**
 * Default packer configuration
 * @type {{global: {clear: any[], copy: {}, browserVue: {rootOutPath: string, packerConfig: {}}, browserVue3: {rootOutPath: string, packerConfig: {}}, library: {rootOutPath: string, packerConfig: {}}, libraryVue3: {rootOutPath: string, packerConfig: {}}, node: {rootOutPath: string, packerConfig: {}}}, server: {port: number, staticPath: string, packerConfig: {}}, entries: {}}}
 */
export const defaultPackerConfig: PackerConfigType = {
  global: {
    // cwd: __dirname,
    clear: [],
    copy: {},
    browserVue2: {
      rootOutPath: "dist/browser/",
      // packerConfig: {}
    },
    browserVue3: {
      rootOutPath: "dist/browser/",
      // packerConfig: {}
    },
    /* library: {
      rootOutPath: 'dist/lib/',
      // packerConfig: {}
    }, */
    libraryVue3: {
      rootOutPath: "dist/lib/",
      // packerConfig: {}
    },
    node: {
      rootOutPath: "dist/server/",
      // packerConfig: {}
    },
  },
  server: {
    port: 8080,
    staticPath: "",
    // packerConfig: {}
  },
  entries: {},
};
