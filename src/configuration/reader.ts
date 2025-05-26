export class ReaderFileLackPermissionsError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly fsErrorCode: string,
  ) {
    super(`File ${filePath} lacks read permissions!`);
  }
}
export interface FileResultType {
  fileName: string; content: string
}
export interface Reader {
  list(): string[];

  read(name: string): { fileName: string, content: string };

  readAnyOf(
    filenames: string[],
  ): FileResultType | undefined | ReaderFileLackPermissionsError;

  parse<TResult>(name: string): Promise<TResult>;
}
