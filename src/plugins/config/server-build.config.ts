import { defineConfig as defineRsbuildConfig, EnvironmentConfig } from "@rsbuild/core";
import { nodeBuiltInModules } from "../../constants.ts";

export async function createConstantRsbuildConfig(): Promise<EnvironmentConfig> {
  // When the default configuration is inconsistent with rsbuild, remember to modify the type hints
  // see https://github.com/web-infra-dev/rslib/discussions/856
  return defineRsbuildConfig({
    dev: {
      progressBar: false,
    },
    performance: {
      chunkSplit: {
        strategy: "custom",
      },
    },
    tools: {
      htmlPlugin: false,
      rspack: [
        {
          optimization: {
            splitChunks: {
              chunks: "async",
            },
            moduleIds: "named",
            nodeEnv: false,
          },
          experiments: {
            rspackFuture: {
              bundlerInfo: {
                force: false,
              },
            },
          },
          resolve: {
            extensionAlias: {
              ".js": [
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
              ],
              ".jsx": [
                ".tsx",
                ".jsx",
              ],
              ".mjs": [
                ".mts",
                ".mjs",
              ],
              ".cjs": [
                ".cts",
                ".cjs",
              ],
            },
          },
        },
        {
          module: {
            parser: {
              javascript: {
                importMeta: false,
                importDynamic: false,
                requireResolve: false,
                requireDynamic: false,
                requireAsExpression: false,
                worker: false,
              },
            },
          },
          output: {
            iife: false,
            chunkFormat: "commonjs",
            library: {
              type: "commonjs-static",
            },
            chunkLoading: "require",
            workerChunkLoading: "async-node",
            wasmLoading: "async-node",
            clean: {
              keep: path => path.includes("config.yaml"),
            },
          },
        },
        {
          target: [
            "node",
          ],
        },
        {
          externalsType: "commonjs-import",
        },
        {
          plugins: [
            /* {
              reactDirectives: {},
              shimsInjectedAssets: {},
              shebangChmod: 493,
              shebangEntries: {},
              shebangInjectedAssets: {},
              enabledImportMetaUrlShim: true,
              contextToWatch: null,
            }, */
          ],
        },
      ],
      swc: {
        minify: true,
        sourceMaps: true,
        jsc: {
          externalHelpers: false,
          minify: {
            compress: {
              unused: true,
            },
            mangle: true,
          },
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    },
    output: {
      target: "node",
      filenameHash: false,
      distPath: {
        js: "./",
        jsAsync: "./",
        css: "./",
        cssAsync: "./",
      },
      filename: {
        js: "[name].cjs",
      },
      externals: [...nodeBuiltInModules],
      dataUriLimit: 0,
      assetPrefix: "auto",
      minify: {
        js: true,
        css: false,
        jsOptions: {
          minimizerOptions: {
            mangle: false,
            minify: false,
            compress: true,
          },
        },
      },
    },
  });
}
