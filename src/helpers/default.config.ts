import {__dirname} from '../constants'
import {IgnorePluginOptions, rspack} from '@rspack/core';
import {ChainedHtmlOption} from "../types/config.ts";

/**
 * 默认打包配置
 */
export const DEFAULT_PACK_CONFIG = {
  global: {
    cwd: __dirname as string,
    // clear: [],
    copy: {},
    node: {
      rootOutPath: 'dist/',
      packerConfig: {
        node: {
          __dirname: false,
          __filename: false,
          global: true
        },
        optimization: {
          moduleIds: 'named'
        },
        externals: [],
        ignoreWarnings: []
      }
    },
    browserVue3: {
      rootOutPath: 'dist/',
      packerConfig: {
        resolve: {
          extensions: ['.js', '.ts', '.json', '.tsx', '.vue'] as string[]
        },
        externals: {
          vue: 'Vue',
          axios: 'axios',
          'vue-router': 'VueRouter',
        }
      }
    }
  },
  server: {
    port: 8080,
    staticPath: "dist/",
    prefix: "",
    packerConfig: {},
    proxy: {}
  },
  entries: {}
}


export const DEFAULT_RSBUILD_CONFIG = {
  plugins: [
    /*pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVue(),
    pluginVueJsx({
      vueJsxOptions: {
        transformOn: true,
      },
    }),
    pluginLess(),*/
  ].filter(Boolean),
  tools: {// 与底层工具有关的选项
    /*rspack: (config: any, {env}: any) => {
      return config;
    },*/
    /*rspack: {
      watchOptions: {
        ignored: /\.git/,
      },
    },*/
    /*bundlerChain: (chain, { CHAIN_ID }) => {
      chain.plugin('rsdoctor').use(RsdoctorRspackPlugin, [
        {
          // 配置项
          // ...
        },
      ]);
    },*/
  },
  resolve: {
    alias: {
      // '@': '/src',
    },
    // 默认值: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json']
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    target: 'web',
    cleanDistPath: false,
    copy: [],
    externals: {
      /*vue: 'Vue',
      axios: 'axios',
      'vue-router': 'VueRouter',
      'element-plus': 'ElementPlus',
      '@cs/element-pro': 'ElementPro',
      '@cs/js-inner-web-framework': 'InnerWebFramework',
      '@cs/table-pro': 'TablePro',
      '@element-plus/icons-vue': 'ElementPlusIconsVue',*/
    },
  },
  html: {
    /*title: ({entryName}: ChainedHtmlOption<string>) => {
      const titles = {
        'flow-design': '审批流程设计',
        'flow-form': '流程表单',
      };
      return titles[entryName] || '默认标题';
    },*/
    mountId: 'app',
    /*template({entryName}) {
      const templates = {
        'flow-design': './src/web-content/module/flow-design/index.html',
        'flow-form': './src/web-content/module/flow-form/index.html',
      };
      return templates[entryName];
    },*/
  },
  source: { // 与输入的源代码相关的选项
    entry: {
      // 'flow-design': './src/web-content/module/flow-design/index.ts',
      // 'flow-form': './src/web-content/module/flow-form/index.ts',
    },
  },
  dev: {
    hmr: false,
    watchFiles: {
      paths: ['src/web-content/**/*']
    },
    writeToDisk: (file) => !file.includes('.hot-update.'),
    progressBar: true,
    lazyCompilation: {
      entries: true,
      imports: true,
    },
  },
  server: {
    // 与 Rsbuild 服务器有关的选项
    // 在本地开发和预览时都会生效
    host: '0.0.0.0',
    base: '',
    port: 8080,
    cors: true,
    // open: '/flow/flow-form.html?productId=1328203429577728&moduleId=1328216389878784#/',
    // proxy: {},
  },
};

const lazyImports = [
  '@nestjs/microservices',
  '@nestjs/microservices/microservices-module',
  '@nestjs/websockets/socket-module',
  '@nestjs/websockets',
  // 'class-validator',
  // 'class-transformer',
  'class-transformer/storage',
  '@fastify/static',
];

const _ignorePlugin: any[] = [];
lazyImports.forEach((lazyImport) => {
  _ignorePlugin.push(
    new rspack.IgnorePlugin({
      checkResource: (resource) => {
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, {
            paths: [process.cwd()],
          });
        } catch (e) {
          return true;
        }
        return false;
      },
    }),
  );
});

/**
 *
 * @type {{context: any, mode: string, target: string, optimization: {minimize: boolean, nodeEnv: boolean}, node: {__dirname: boolean, __filename: boolean}, plugins: any[], watchOptions: {ignored: RegExp}, resolve: {extensions: string[], tsConfig: string}, experiments: {lazyCompilation: {entries: boolean, imports: boolean}}, entry: {}, output: {path: string, filename: string}, externals: any[], externalsPresets: {node: boolean}, module: {rules: {test: RegExp, use: {loader: string, options: {transpileOnly: boolean}}[], exclude: RegExp}[]}, devServer: {host: string, port: number}}}
 */
export const DEFAULT_RSPACK_CONFIG = {
  context: __dirname,
  // mode: 'development',
  target: 'node',
  optimization: {
    minimize: false, // 对产物进行压缩
    nodeEnv: false,
  },
  // devtools: !isProduction ? 'inline-source-map' : false,
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    ..._ignorePlugin,
  ],
  watchOptions: {
    // for some systems, watching many files can result in a lot of CPU or memory usage
    // https://rspack.dev/config/watch#watchoptionsignored
    // don't use this pattern, if you have a monorepo with linked packages
    ignored: /node_modules/,
    poll: 1000, // 轮询监听时间
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // tsConfig: path.resolve(__dirname, './tsconfig.json'),
  },
  experiments: {
    // lazyCompilation: true,
    lazyCompilation: {
      entries: true,
      imports: true,
    },
  },
  entry: {
    // main: './src/controllers/main.ts',
  },
  output: {
    path: './dist', // path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  ignoreWarnings: [/^(?!CriticalDependenciesWarning$)/],
  externals: [/*nodeExternals() as any*/],
  externalsPresets: {node: true},
  module: {
    rules: [
      /*{
        test: /.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              // configFile: './tsconfig.json',
            },
          },
        ],
        exclude: /node_modules/,
      },*/
    ],
  },
  devServer: {
    host: '0.0.0.0',
    port: 3031
  }
};


/**
 * 服务器默认配置
 * @type {{port: number, open: boolean, hmr: boolean, host: string, base: string, cors: boolean}}
 */
export const defaultWebServeConfig = {
  base: '',
  cors: true,

  host: '0.0.0.0',
  port: 8080,
  open: false,
  prefix: '',
  // proxy: {},
};

/**
 * 输出目录默认配置
 * @type {{target: string, cleanDistPath: boolean, copy: any[], externals: {vue: string, axios: string, 'vue-router': string, 'element-plus': string, '@element-plus/icons-vue': string}}}
 */
export const defaultWebOutputConfig = {
  target: 'web',
  cleanDistPath: false,
  // copy: [],
  externals: {
    vue: 'Vue',
    axios: 'axios',
    'vue-router': 'VueRouter',
    'element-plus': 'ElementPlus',
    '@element-plus/icons-vue': 'ElementPlusIconsVue',
  },
};
