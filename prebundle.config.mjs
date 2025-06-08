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
    'tinyglobby',
    {
      name: 'chokidar',
      // strip sourcemap comment
      prettier: true,
    },
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
  ]
}
