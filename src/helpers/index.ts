import color from '../../compiled/picocolors/index.js';
import {
  type MultiStats,
  type Stats,
} from "@rspack/core";
export const getNodeEnv = () => process.env.NODE_ENV as string;
export const setNodeEnv = (env = ''): void => {
  if (['development', 'production'].includes(env)) {
    process.env.NODE_ENV = env;
  }
};

export const isObject = (obj: unknown): obj is Record<string, any> =>
  Object.prototype.toString.call(obj) === '[object Object]';

export {color};
