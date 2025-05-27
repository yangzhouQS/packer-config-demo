#!/usr/bin/env node
// const nodeModule = require("node:module");

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

process.title = 'packer-cli';
// const {PackerCli} = require('../dist/index.js');
const {PackerCli}  = require('../dist/index.cjs');

async function main() {
  console.log(PackerCli);
  const cli = new PackerCli();
  await cli.run();
}

main();
