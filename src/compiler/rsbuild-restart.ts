import type { RsbuildInstance } from "@rsbuild/core";
import type { ChokidarOptions } from "chokidar";
import path from "node:path";
import process from "node:process";

import { color } from "../helpers";
import { isTTY } from "../helpers/process-hook.ts";
import { logger } from "../logger.ts";

type Cleaner = () => Promise<unknown> | unknown;

let cleaners: Cleaner[] = [];

/**
 * Add a cleaner to handle side effects
 */
export function onBeforeRestartServer(cleaner: Cleaner): void {
  cleaners.push(cleaner);
}

function clearConsole() {
  if (isTTY() && !process.env.DEBUG) {
    process.stdout.write("\x1B[H\x1B[2J");
  }
}

async function beforeRestart({
  filePath,
  clear = true,
  id,
}: {
  filePath?: string;
  clear?: boolean;
  id: string;
}): Promise<void> {
  if (clear) {
    clearConsole();
  }

  if (filePath) {
    const filename = path.basename(filePath);
    logger.info(`restarting ${id} as ${color.yellow(filename)} changed\n`);
  }
  else {
    logger.info(`restarting ${id}...\n`);
  }

  for (const cleaner of cleaners) {
    await cleaner();
  }
  cleaners = [];
}

export async function restartDevServer({
  rsbuild,
  filePath,
  clear = true,
}: {
  rsbuild?: RsbuildInstance;
  filePath?: string;
  clear?: boolean;
} = {}): Promise<boolean> {
  await beforeRestart({ filePath, clear, id: "server" });

  // Skip the following logic if restart failed,
  // maybe user is editing config file and write some invalid config
  if (!rsbuild) {
    return false;
  }

  await rsbuild.startDevServer();
  return true;
}

async function restartBuild({
  rsbuild,
  filePath,
  clear = true,
}: {
  rsbuild?: RsbuildInstance;
  filePath?: string;
  clear?: boolean;
} = {}): Promise<boolean> {
  await beforeRestart({ filePath, clear, id: "build" });

  // Skip the following logic if restart failed,
  // maybe user is editing config file and write some invalid config
  if (!rsbuild) {
    return false;
  }

  const buildInstance = await rsbuild.build({ watch: true });
  onBeforeRestartServer(buildInstance.close);
  return true;
}

export async function watchFilesForRestart({
  files,
  isBuildWatch,
  watchOptions,
  rsbuild,
}: {
  files: string[];
  rsbuild: RsbuildInstance;
  isBuildWatch: boolean;
  watchOptions?: ChokidarOptions;
}): Promise<void> {
  if (!files.length) {
    return;
  }

  const chokidar = await import("chokidar");

  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    // If watching fails due to read permissions, the errors will be suppressed silently.
    ignorePermissionErrors: true,
    ...watchOptions,
  });

  // const root = rsbuild.context.rootPath;
  let restarting = false;

  const onChange = async (filePath: string) => {
    if (restarting) {
      return;
    }
    restarting = true;

    const restarted = isBuildWatch
      ? await restartBuild({ filePath, rsbuild })
      : await restartDevServer({ filePath, rsbuild });

    if (restarted) {
      await watcher.close();
    }
    else {
      logger.error(
        isBuildWatch ? "Restart build failed." : "Restart server failed.",
      );
    }

    restarting = false;
  };

  watcher.on("add", onChange);
  watcher.on("change", onChange);
  watcher.on("unlink", onChange);
}
