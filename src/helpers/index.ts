import type { Mode } from "@rspack/core";
import process from "node:process";
import color from "picocolors";

// export type Mode = "development" | "production" | "none";
export const getNodeEnv = (): Mode => process.env.NODE_ENV as Mode;
export function setNodeEnv(env = ""): void {
  if (["development", "production"].includes(env)) {
    process.env.NODE_ENV = env;
  }
}

export function isObject(obj: unknown): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export { color };

export type Awaitable<T> = T | Promise<T>;
export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m;
  return (resolved as any).default || resolved;
}
export function castArray<T>(arr?: T | T[]): T[] {
  if (arr === undefined) {
    return [];
  }
  return Array.isArray(arr) ? arr : [arr];
}
