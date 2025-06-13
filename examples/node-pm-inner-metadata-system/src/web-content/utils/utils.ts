import dayjs from "dayjs";
import { get } from "lodash";
import { GlobalMessage } from "../components/global/global-message";
import { createModuleEventBus } from "./event-bus";

export function errorMessage(error: Error, errorTip = "处理失败") {
  return get(error, "response.data.message", errorTip);
}

export function catchMessage(errorTip = "处理失败") {
  return function (error: Error) {
    const code = get(error, "response.data.code");
    const status = get(error, "response.status");
    const message = get(error, "response.data.message", errorTip);
    if (code === 400 || status === 400) {
      GlobalMessage.warning(message);
    }
    else {
      GlobalMessage.error(message);
    }
  };
}

export const productEvent = createModuleEventBus("Module:ProductEvent");
export const roleEvent = createModuleEventBus("Module:RoleEvent");
export const userEvent = createModuleEventBus("Module:UserEvent");

/**
 * 日期格式化
 * @param date
 * @param format
 */
export function formatDate(date = new Date(), format = "YYYY-MM-DD HH:mm:ss") {
  return dayjs(date).format(format);
}

export function disposeFunction(fns = []) {
  fns.forEach((fn) => {
    if (typeof fn === "function") {
      fn();
    }
  });
}

/**
 * 解析url参数
 * @param {string} url
 * @returns {any}
 */
export function getUrlParameters<T>(url = location.href): any {
  if (!url.includes("?")) {
    return {};
  }
  // 移除hash部分
  if (url.indexOf("#") > 0) {
    url = url.split("#")[0];
  }
  return JSON.parse(`{"${decodeURI(url.split("?")[1]).replace(/"/g, "\\\"").replace(/&/g, "\",\"").replace(/=/g, "\":\"")}"}`) as T;
}
