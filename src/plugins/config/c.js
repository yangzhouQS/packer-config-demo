const c = {
  mode: "production",
  environments: {
    cjs: {
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
              {
                reactDirectives: {},
                shimsInjectedAssets: {},
                shebangChmod: 493,
                shebangEntries: {},
                shebangInjectedAssets: {},
                enabledImportMetaUrlShim: true,
                contextToWatch: null,
              },
            ],
          },
        ],
        swc: {
          jsc: {
            externalHelpers: false,
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
        overrideBrowserslist: [
          "chrome >= 91.0.0",
          "edge >= 91.0.0",
          "firefox >= 80.0.0",
          "ios >= 16.4.0",
          "node >= 16.1.0",
          "opera >= 77.0.0",
          "safari >= 16.4.0",
        ],
        filename: {
          js: "[name].cjs",
        },
        externals: [
          "webpack",
          "@rspack/core",
          "@rsbuild/core",
          "@rsbuild/core/client/hmr",
          "@rsbuild/core/client/overlay",
          "fs-extra",
          "@rsbuild/plugin-less",
          "@rsbuild/plugin-vue",
          "@rsbuild/plugin-babel",
          "@rsbuild/plugin-vue-jsx",
          "@cs/webpages-packer-browser-vue3",
          "cac",
          "tree-kill",
          "deepmerge",
          "param-case",
          "jiti",
          "webpack-merge",
          "@rspack/cli",
          "@rspack/core",
          "@rsbuild/core",
          "tinyglobby",
          "rslog",
          "picocolors",
          "fs-extra",
          "lodash.get",
          "webpack-node-externals",
          "node-polyfill-webpack-plugin",
          "ts-node",
          "ts-loader",
          "chokidar",
          "assert",
          "assert/strict",
          "async_hooks",
          "buffer",
          "child_process",
          "cluster",
          "console",
          "constants",
          "crypto",
          "dgram",
          "diagnostics_channel",
          "dns",
          "dns/promises",
          "domain",
          "events",
          "fs",
          "fs/promises",
          "http",
          "http2",
          "https",
          "inspector",
          "inspector/promises",
          "module",
          "net",
          "os",
          "path",
          "path/posix",
          "path/win32",
          "perf_hooks",
          "process",
          "punycode",
          "querystring",
          "readline",
          "readline/promises",
          "repl",
          "stream",
          "stream/consumers",
          "stream/promises",
          "stream/web",
          "string_decoder",
          "sys",
          "timers",
          "timers/promises",
          "tls",
          "trace_events",
          "tty",
          "url",
          "util",
          "util/types",
          "v8",
          "vm",
          "wasi",
          "worker_threads",
          "zlib",
          "pnpapi",
        ],
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
      plugins: [
        {
          name: "rsbuild:cjs-import-meta-url-shim",
        },
        {
          name: "rsbuild:disable-url-parse",
        },
        {
          name: "rsbuild:lib-asset",
          pre: [
            "rsbuild:svgr",
          ],
        },
        {
          name: "rsbuild:lib-entry-chunk",
        },
      ],
      source: {
        define: {
        },
        entry: {},
      },
    },
  },
};
