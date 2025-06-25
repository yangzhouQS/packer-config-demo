console.log('配置文件 1222');
module.exports = {
  global: {
    cwd: __dirname,
    clear: ["dist2"],
    copy: {
      "src/web-content/assets": "dist/lib/assets",
      // 'src/controllers/config.yaml': 'dist/config.yaml',
      "node_modules/vue/dist": "dist/lib/vue",
      "node_modules/axios/dist": "dist/lib/axios",
      "node_modules/vue-router/dist": "dist/lib/vue-router",
      "node_modules/@element-plus/icons-vue/dist": "dist/lib/element-plus/icons-vue",
      "node_modules/element-plus/dist": "dist/lib/element-plus",
      "node_modules/@cs/element-pro/lib": "dist/lib/element-pro",
      "node_modules/@cs/js-inner-web-framework/dist": "dist/lib/@cs/js-inner-web-framework/dist",
      "node_modules/dayjs/dayjs.min.js": "dist/lib/dayjs.min.js",
      "node_modules/lodash/lodash.min.js": "dist/lib/lodash.min.js",
    },
    node: {
      rootOutPath: "dist/",
      packerConfig: {
        node: {
          __dirname: false,
          __filename: false,
          global: true,
        },
        optimization: {
          moduleIds: "named",
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
        ],
      },
    },
    browserVue3: {
      rootOutPath: "dist/",
      packerConfig: {
        resolve: {
          extensions: [".js", ".ts", ".json", ".tsx", ".vue"],
        },
        externals: {
          /* "vue": "Vue",
          "axios": "axios",
          "vue-router": "VueRouter",
          "element-plus": "ElementPlus",
          "@cs/element-pro": "ElementPro",
          "@cs/js-inner-web-framework": "InnerWebFramework",
          "@cs/table-pro": "TablePro",
          "@element-plus/icons-vue": "ElementPlusIconsVue", */
        },
      },
    },
  },
  server: {
    hmr: true,
    port: 8080,
    // reloadType: 'reload-server',
    staticPath: "dist/",
    prefix: "/inner",
    packerConfig: {},
    proxy: {
      isEnable: true,
      sites: [
        /* {
          proxyPrefix: "/!*",
          targetUrl: "http://dev.yearrow.com",
          skipPath: ["approve", "approveServer"]
        }, */
        {
          proxyPrefix: "/pm-inner-metadata",
          // targetUrl: "http://dev.yearrow.com",
          targetUrl: "http://172.17.208.1:3013/pm-inner-metadata",
          skipPath: [],
        },
      ],
    },
  },
  entries: {
    server: {
      type: "node",
      name: "server",
      output: {
        fileName: "main.js",
        filePath: "dist/controllers",
      },
      input: "src/controllers/main.ts",
    },
    /*login: {
      type: "browserVue3",
      title: "支撑系统登录页",
      input: "src/web-content/module/login/index.ts",
    },*/
    /*
    index: {
      type: "browserVue3",
      title: "协同管理 | 主页",
      input: "src/web-content/module/index/index.ts",
    },
    permission: {
      type: "browserVue3",
      title: "权限管理",
      input: "src/web-content/module/permission/main.ts",
    },
    product: {
      type: "browserVue3",
      title: "产品管理",
      input: "src/web-content/module/product/main.ts",
    },
    innerUser: {
      type: "browserVue3",
      title: "后台用户管理",
      input: "src/web-content/module/inner-user/main.ts",
    },*/
  },
};
