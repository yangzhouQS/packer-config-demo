import { join } from 'node:path';
import fs from 'fs-extra';

function replaceFileContent(filePath, replaceFn) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const newContent = replaceFn(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
  }
}

/** @type {import('prebundle').Config} */
export default {
  prettier: true,
  externals: {
    '@rspack/core': '@rspack/core',
    '@rspack/lite-tapable': '@rspack/lite-tapable',
    typescript: 'typescript',
  },
  dependencies:[
    // 'tinyglobby',
    'chokidar',
    {
      name: 'rslog',
      afterBundle(task) {
        // use the cjs bundle of rslog
        fs.copyFileSync(
          join(task.depPath, 'dist/index.cjs'),
          join(task.distPath, 'index.js'),
        );
      },
    },
    {
      name: 'picocolors',
      beforeBundle({ depPath }) {
        const typesFile = join(depPath, 'types.ts');
        // Fix type bundle
        if (fs.existsSync(typesFile)) {
          fs.renameSync(typesFile, join(depPath, 'types.d.ts'));
        }
      },
    },
    {
      name: 'webpack-bundle-analyzer',
      externals: {
        webpack: 'webpack',
      },
      afterBundle(task) {
        // webpack type does not exist, use `@rspack/core` instead
        replaceFileContent(join(task.distPath, 'index.d.ts'), (content) =>
          content.replace("from 'webpack'", 'from "@rspack/core"'),
        );
      },
    },
    {
      name: 'http-proxy-middleware',
      externals: {
        // express is a peer dependency, no need to provide express type
        express: 'express',
      },
      beforeBundle(task) {
        replaceFileContent(
          join(task.depPath, 'dist/types.d.ts'),
          (content) =>
            `${content.replace(
              "import type * as httpProxy from 'http-proxy'",
              "import type httpProxy from 'http-proxy'",
            )}`,
        );
      },
      afterBundle(task) {
        replaceFileContent(
          join(task.distPath, 'index.d.ts'),
          (content) =>
            // TODO: Due to the breaking change of http-proxy-middleware, it needs to be upgraded in rsbuild 2.0
            // https://github.com/chimurai/http-proxy-middleware/pull/730
            `${content
              .replace('express.Request', 'http.IncomingMessage')
              .replace('express.Response', 'http.ServerResponse')
              .replace("import * as express from 'express';", '')
              .replace(
                'extends express.RequestHandler {',
                `{
  (req: Request, res: Response, next?: (err?: any) => void): void | Promise<void>;`,
              )}`,
        );
      },
    },
  ]
}
