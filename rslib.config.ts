import { defineConfig } from '@rslib/core';
import pkgJson from './package.json';

const define = {
  PACKER_VERSION: JSON.stringify(pkgJson.version),
  PACKER_NAME:  JSON.stringify(pkgJson.name),
};
export default defineConfig({
  source: {
    define,
  },
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
    },
  ],
});
