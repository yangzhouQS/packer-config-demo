#!/usr/bin/env node
import process from "node:process";
import { PackerServerCli } from "../dist/webpages-server.js";

process.title = "packer-server-cli";

async function main() {
  const cli = new PackerServerCli();
  await cli.run();
}

main();
