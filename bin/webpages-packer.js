#!/usr/bin/env node
import nodeModule from "node:module";
import process from "node:process";
import { PackerCli } from "../dist/index.js";

console.log("bootstrap init ---------");
// enable on-disk code caching of all modules loaded by Node.js
// requires Nodejs >= 22.8.0
const { enableCompileCache } = nodeModule;
if (enableCompileCache) {
  try {
    enableCompileCache();
  }
  catch {
    // ignore errors
  }
}
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

process.title = "packer-cli";

async function main() {
  const cli = new PackerCli();
  await cli.run();
}

main();
