module.exports = {
  global: {
    cwd: __dirname,
    clear: ['dist2'],
    copy: {
      "src/web-content/assets": "dist/lib/assets",
      // 'src/controllers/config.yaml': 'dist/config.yaml',
      'node_modules/vue/dist': 'dist/lib/vue',
      'node_modules/axios/dist': 'dist/lib/axios',
      'node_modules/vue-router/dist': 'dist/lib/vue-router',
      "node_modules/@element-plus/icons-vue/dist": "dist/lib/element-plus/icons-vue",
      'node_modules/element-plus/dist': 'dist/lib/element-plus',
      "node_modules/@cs/element-pro/lib": "dist/lib/element-pro",
      "node_modules/@cs/js-inner-web-framework/dist": "dist/lib/@cs/js-inner-web-framework/dist",
      "node_modules/dayjs/dayjs.min.js": "dist/lib/dayjs.min.js",
      "node_modules/lodash/lodash.min.js": "dist/lib/lodash.min.js",
    },
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
        externals: [
          // 添加不需要打包的node_modules依赖
          // /^@nestjs\/.+$/,
          // 'class-transformer',
          // 'class-validator',
          // 'reflect-metadata',
        ],
        ignoreWarnings: [
          // {
          //   module: /@nestjs|express/, // 忽略@nestjs和express相关的警告
          // },
          // {
          //   message: /Critical dependency/, // 忽略Critical dependency警告
          // },
        ]
      }
    },
    browserVue3: {
      rootOutPath: 'dist/',
      packerConfig: {
        resolve: {
          extensions: ['.js', '.ts', '.json', '.tsx', '.vue']
        },
        externals: {
          vue: 'Vue',
          axios: 'axios',
          'vue-router': 'VueRouter',
          'element-plus': 'ElementPlus',
          '@cs/element-pro': 'ElementPro',
          '@cs/js-inner-web-framework': 'InnerWebFramework',
          '@cs/table-pro': 'TablePro',
          '@element-plus/icons-vue': 'ElementPlusIconsVue'
        }
      }
    }
  },
  server: {
    port: 8088,
    staticPath: "dist/",
    prefix: "/meta",
    packerConfig: {},
    proxy: {
      isEnable: true,
      sites: [
        /*{
          proxyPrefix: "/!*",
          targetUrl: "http://dev.yearrow.com",
          skipPath: ["approve", "approveServer"]
        },*/
        /*{
          proxyPrefix: "/pm-inner-metadata",
          // targetUrl: "http://dev.yearrow.com",
          targetUrl: "http://172.17.208.1:3013/pm-inner-metadata",
          skipPath: []
        }*/
      ]
    }
  },
  entries: {
    server: {
      type: 'node',
      name: 'server',
      output: {
        fileName: 'main.js',
        filePath: 'dist/controllers',
      },
      input: 'src/controllers/main.ts',
    },
    flowForm: {
      type: 'browserVue3',
      title: '流程表单',
      input: 'examples/src/web-content/module/flow-form/index.ts'
    },
    flowDesign: {
      type: 'browserVue3',
      title: '审批流程',
      input: 'examples/src/web-content/module/flow-design/index.ts'
    }
  }
};
