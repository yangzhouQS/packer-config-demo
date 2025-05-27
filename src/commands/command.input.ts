export interface Input<T = any> {
  name: string;
  value: boolean | string | undefined | null | T;
  options?: never;
}
