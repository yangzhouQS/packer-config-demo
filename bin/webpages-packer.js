#!/usr/bin/env node
// const nodeModule = require("node:module");
import nodeModule from 'node:module';

// enable on-disk code caching of all modules loaded by Node.js
// requires Nodejs >= 22.8.0
const {enableCompileCache} = nodeModule;
if (enableCompileCache) {
  try {
    enableCompileCache();
  } catch {
    // ignore errors
  }
}
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

process.title = 'packer-cli';
// const {PackerCli} = require('../dist/index.js');
import {PackerCli} from '../dist/index.js';

async function main() {
  console.log(PackerCli);
  const cli = new PackerCli();
  // await cli.run(process.argv);
}

main();
