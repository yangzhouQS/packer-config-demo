import type { MultiStats, Stats } from "@rspack/core";
import { ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { logger } from "@rsbuild/core";
import killProcess from "tree-kill";
import { treeKillSync } from "./tree-kill";

export function createOnSuccessHook(
  entryFile: string,
  sourceRoot: string,
  debugFlag: boolean | string | undefined,
  outDirName: string,
  binaryToRun: string,
  options: {
    shell: boolean;
    envFile?: string;
  },
) {
  let childProcessRef: any;

  // 监听进程退出事件，确保进程退出时能够清理子进程
  process.on("exit", () => {
    if (childProcessRef) {
      treeKillSync(childProcessRef.pid);
    }
  });

  return (): void => {
    if (childProcessRef) {
      childProcessRef.removeAllListeners("exit");
      childProcessRef.on("exit", () => {
        childProcessRef = spawnChildProcess({
          entryFile,
          sourceRoot,
          debug: debugFlag,
          outDirName,
          binaryToRun,
          options: { shell: true, envFile: "" },
        });
        childProcessRef.on("exit", () => (childProcessRef = undefined));
      });

      childProcessRef.stdin && childProcessRef.stdin.pause();
      killProcess(childProcessRef.pid);
    }
    else {
      childProcessRef = spawnChildProcess(
        {
          entryFile,
          sourceRoot,
          debug: debugFlag,
          outDirName,
          binaryToRun,
          options: {
            shell: options.shell,
            envFile: options.envFile,
          },
        },
      );
      childProcessRef.on("exit", (code: number) => {
        process.exitCode = code;
        childProcessRef = undefined;
      });
    }
  };
}

/**
 * 创建一个子进程来运行编译后的文件
 * @param {string} entryFile
 * @param {string} outDirName
 * @param {boolean} debug
 * @param {string} binaryToRun
 * @param {string} sourceRoot
 * @param {{shell: boolean, envFile?: string}} options
 * @returns {ChildProcess}
 */
function spawnChildProcess(
  {
    entryFile,
    outDirName,
    debug,
    binaryToRun,
    sourceRoot,
    options,
  }: {
    entryFile: string;
    outDirName: string;
    sourceRoot: string;
    debug: boolean | string | undefined;
    binaryToRun: string;
    options: {
      shell: boolean;
      envFile?: string;
    };
  },
): ChildProcess {
  logger.debug("-----------------childProcess------------------");

  let outputFilePath = path.join(outDirName, sourceRoot, entryFile);

  if (!fs.existsSync(`${outputFilePath}.js`)) {
    outputFilePath = path.join(outDirName, entryFile);
  }

  let childProcessArgs: string[] = [];
  const argsStartIndex = process.argv.indexOf("--");

  if (argsStartIndex >= 0) {
    // Prevents the need for users to double escape strings
    // i.e. I can run the more natural
    //   nest start -- '{"foo": "bar"}'
    // instead of
    //   nest start -- '\'{"foo": "bar"}\''
    childProcessArgs = process.argv
      .slice(argsStartIndex + 1)
      .map(arg => JSON.stringify(arg));
  }
  outputFilePath
    = outputFilePath.includes(" ") ? `"${outputFilePath}"` : outputFilePath;

  const processArgs = [outputFilePath, ...childProcessArgs];
  if (debug) {
    const inspectFlag
      = typeof debug === "string" ? `--inspect=${debug}` : "--inspect";
    processArgs.unshift(inspectFlag);
  }
  if (options.envFile) {
    processArgs.unshift(`--env-file=${options.envFile}`);
  }
  processArgs.unshift("--enable-source-maps");

  // 创建一个子进程来运行编译后的文件
  return spawn(binaryToRun, processArgs, {
    stdio: "inherit",
    shell: options.shell,
  });
}

export function getEnvDir(cwd: string, envDir?: string): string {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.join(cwd, envDir);
  }
  return cwd;
}

/**
 * Check if running in a TTY context
 */
export function isTTY(type: "stdin" | "stdout" = "stdout"): boolean {
  return (
    (type === "stdin" ? process.stdin.isTTY : process.stdout.isTTY)
    && !process.env.CI
  );
}

export function createAfterCallback(
  onSuccess: (() => void) | undefined,
  watch: boolean | undefined,
) {
  return (err: Error | null, stats?: Stats | MultiStats | undefined) => {
    // node 运行过程出现错误
    if (err && stats === undefined) {
      console.log(err);
      return process.exit(1);
    }

    const statsOutput = stats!.toString({
      chunks: false,
      colors: true,
      modules: false,
      assets: false,
    });

    if (!err && !stats!.hasErrors()) {
      if (!onSuccess) {
        console.log("assetsManager.closeWatchers()");
      }
      else {
        onSuccess();
      }
    }
    else if (!watch) {
      console.log(statsOutput);
      return process.exit(1);
    }
    console.log(statsOutput);
  };
}
