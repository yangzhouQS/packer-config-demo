import { defineConfig } from '@rslib/core';
import pkgJson from './package.json';
import type { Configuration } from '@rspack/core';
import prebundleConfig from './prebundle.config';

const define = {
  PACKER_VERSION: JSON.stringify(pkgJson.version),
  PACKER_NAME:  JSON.stringify(pkgJson.name),
};

const regexpMap: Record<string, RegExp> = {};

for (const item of prebundleConfig.dependencies) {
  const depName = typeof item === 'string' ? item : item.name;
  regexpMap[depName] = new RegExp(`compiled[\\/]${depName}(?:[\\/]|$)`);
}

const externals: Configuration['externals'] = [
  'webpack',
  '@rspack/core',
  '@rsbuild/core',
  '@rsbuild/core/client/hmr',
  '@rsbuild/core/client/overlay',
  ({ request }, callback) => {
    const entries = Object.entries(regexpMap);
    if (request) {
      for (const [name, test] of entries) {
        if (request === name) {
          throw new Error(
            `"${name}" is not allowed to be imported, use "../compiled/${name}/index.js" instead.`,
          );
        }
        if (test.test(request)) {
          return callback(undefined, `../compiled/${name}/index.js`);
        }
      }
    }
    callback();
  },
];

export default defineConfig({
  source: {
    define,
  },
  output: {
    externals,
  },
  lib: [
    {
      format: 'esm',
      // syntax: ['node 18'],
      syntax: 'es2021',
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      // syntax: ['node 18'],
    },
  ],
});
