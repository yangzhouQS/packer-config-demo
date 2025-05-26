import killProcess from 'tree-kill';
import path from 'path';
import fs from 'fs';
import {ChildProcess, spawn} from 'child_process';
import {logger} from '@rsbuild/core';
import {treeKillSync} from "./tree-kill";


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
  process.on('exit', () => {
    if (childProcessRef) {
      treeKillSync(childProcessRef.pid);
    }
  });

  return (): void => {
    if (childProcessRef) {
      childProcessRef.removeAllListeners('exit');
      childProcessRef.on('exit', () => {
        childProcessRef = spawnChildProcess({
          entryFile,
          sourceRoot,
          debug: debugFlag,
          outDirName,
          binaryToRun,
          options: {shell: true, envFile: ''},
        });
        childProcessRef.on('exit', () => (childProcessRef = undefined));

      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      childProcessRef.stdin && childProcessRef.stdin.pause();
      killProcess(childProcessRef.pid);
    } else {
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
      childProcessRef.on('exit', (code: number) => {
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
    },
  },
): ChildProcess {
  logger.debug('-----------------childProcess------------------');

  let outputFilePath = path.join(outDirName, sourceRoot, entryFile);

  if (!fs.existsSync(outputFilePath + '.js')) {
    outputFilePath = path.join(outDirName, entryFile);
  }

  let childProcessArgs: string[] = [];
  const argsStartIndex = process.argv.indexOf('--');

  if (argsStartIndex >= 0) {
    // Prevents the need for users to double escape strings
    // i.e. I can run the more natural
    //   nest start -- '{"foo": "bar"}'
    // instead of
    //   nest start -- '\'{"foo": "bar"}\''
    childProcessArgs = process.argv
      .slice(argsStartIndex + 1)
      .map((arg) => JSON.stringify(arg));
  }
  outputFilePath =
    outputFilePath.indexOf(' ') >= 0 ? `"${outputFilePath}"` : outputFilePath;


  const processArgs = [outputFilePath, ...childProcessArgs];
  if (debug) {
    const inspectFlag =
      typeof debug === 'string' ? `--inspect=${debug}` : '--inspect';
    processArgs.unshift(inspectFlag);
  }
  if (options.envFile) {
    processArgs.unshift(`--env-file=${options.envFile}`);
  }
  processArgs.unshift('--enable-source-maps');

  // 创建一个子进程来运行编译后的文件
  return spawn(binaryToRun, processArgs, {
    stdio: 'inherit',
    shell: options.shell,
  });
}


export const getEnvDir = (cwd: string, envDir?: string): string => {
  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.join(cwd, envDir);
  }
  return cwd;
};


/**
 * Check if running in a TTY context
 */
export const isTTY = (type: 'stdin' | 'stdout' = 'stdout'): boolean => {
  return (
    (type === 'stdin' ? process.stdin.isTTY : process.stdout.isTTY) &&
    !process.env.CI
  );
};
