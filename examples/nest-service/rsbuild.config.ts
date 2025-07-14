import {defineConfig, rspack} from '@rsbuild/core';
import process from "node:process";


const lazyImports = [
  "@nestjs/microservices",
  "@nestjs/microservices/microservices-module",
  "@nestjs/websockets/socket-module",
  "@nestjs/websockets",
  // 'class-validator',
  // 'class-transformer',
  "class-transformer/storage",
  "@fastify/static",
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

export default defineConfig({
  dev: {
    hmr: true,
  },
  resolve: {
    alias: {},
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  source: {
    entry: {
      main: "./src/main.ts"
    },
    define: {},
    decorators: {
      version: "legacy"
    }
  },
  output: {
    target: 'node',
  },
  tools: {
    rspack: (config, {env}) => {
      config.ignoreWarnings = [/^(?!CriticalDependenciesWarning$)/];

      config.plugins.push(..._ignorePlugin)
      return config;
    }
  }
});
