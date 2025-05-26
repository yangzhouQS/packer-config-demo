import {createJiti } from 'jiti';
import fs from "fs";
import path from "node:path";
import {FileResultType, ReaderFileLackPermissionsError} from "./reader";

export class FileSystemReader {

  constructor(private readonly directory: string) {
  }

  public list(): string[] {
    return fs.readdirSync(this.directory);
  }

  public read(name: string): FileResultType {
    return {
      fileName: name,
      content: fs.readFileSync(path.resolve(this.directory, name), 'utf-8'),
    }
  }

  public readAnyOf(
    filenames: string[],
  ): FileResultType | ReaderFileLackPermissionsError | undefined{
    let firstFilePathFoundButWithInsufficientPermissions: string | undefined;

    for (let id = 0; id < filenames.length; id++) {
      const file = filenames[id];

      try {
        return this.read(file);
      } catch (readErr: any) {
        if (
          !firstFilePathFoundButWithInsufficientPermissions &&
          typeof readErr?.code === 'string'
        ) {
          const isInsufficientPermissionsError =
            readErr.code === 'EACCES' || readErr.code === 'EPERM';
          if (isInsufficientPermissionsError) {
            firstFilePathFoundButWithInsufficientPermissions = readErr.path;
          }
        }

        const isLastFileToLookFor = id === filenames.length - 1;
        if (!isLastFileToLookFor) {
          continue;
        }

        if (firstFilePathFoundButWithInsufficientPermissions) {
          return new ReaderFileLackPermissionsError(
            firstFilePathFoundButWithInsufficientPermissions,
            readErr.code,
          );
        } else {
          return undefined;
        }
      }
    }
  }

  public async parse<TResult>(name: string): Promise<TResult> {
    const jiti = createJiti(this.directory, {
      // disable require cache to support restart CLI and read the new config
      moduleCache: false,
      interopDefault: true,
      // Always use native `require()` for these packages,
      // This avoids `@rspack/core` being loaded twice.
      nativeModules: ['@rspack/core', 'typescript'],
    });
    return await jiti.import(path.resolve(this.directory, name), {default: true});
  }
}
