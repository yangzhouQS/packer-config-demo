import type { Minify } from "@rsbuild/core";
import type { Configuration } from "@rspack/core";
import { defineConfig } from "@rslib/core";
import pkgJson from "./package.json";
import prebundleConfig from "./prebundle.config";

const define = {
  PACKER_VERSION: JSON.stringify(pkgJson.version),
  PACKER_NAME: JSON.stringify(pkgJson.name),
};

export const commonExternals: Array<string | RegExp> = [
  "webpack",
  /[\\/]compiled[\\/]/,
];

const regexpMap: Record<string, RegExp> = {};

for (const item of prebundleConfig.dependencies) {
  const depName = typeof item === "string" ? item : item.name;
  regexpMap[depName] = new RegExp(`compiled[\\/]${depName}(?:[\\/]|$)`);
}

const externals: Configuration["externals"] = [
  "webpack",
  "@rspack/core",
  "@rsbuild/core",
  "@rsbuild/core/client/hmr",
  "@rsbuild/core/client/overlay",
  "fs-extra",
  /* css预处理依赖插件 */
  "@rsbuild/plugin-less",
  /* vue3依赖插件 */
  "@rsbuild/plugin-vue",
  "@rsbuild/plugin-babel",
  "@rsbuild/plugin-vue-jsx",
  "@cs/webpages-packer-browser-vue3",
  /* ({request}, callback) => {
    const entries = Object.entries(regexpMap);
    if (request) {
      for (const [name, test] of entries) {
        if (request === name) {
          /!*throw new Error(
            `"${name}" is not allowed to be imported, use "../compiled/${name}/index.js" instead.`,
          );*!/
        }
        if (test.test(request)) {
          return callback(undefined, `../compiled/${name}/index.js`);
        }
      }
    }
    callback();
  }, */
];

export const nodeMinifyConfig: Minify = {
  js: true,
  css: false,
  jsOptions: {
    minimizerOptions: {
      // preserve variable name and disable minify for easier debugging
      mangle: false,
      minify: false,
      compress: true,
    },
  },
};

export default defineConfig({
  source: {
    define,
  },
  output: {
    externals,
  },
  lib: [
    {
      format: "esm",
      // syntax: ['node 18'],
      syntax: "es2021",
      dts: true,
      output: {
        minify: nodeMinifyConfig,
      },
    },
    {
      format: "cjs",
      syntax: "es2021",
      // syntax: ['node 18'],
      output: {
        minify: nodeMinifyConfig,
      },
    },
  ],
  /* tools: {
    rspack: {
      externals: commonExternals,
    },
  }, */
});
