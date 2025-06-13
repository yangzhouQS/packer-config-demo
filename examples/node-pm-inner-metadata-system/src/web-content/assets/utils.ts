import * as CryptoJS from 'crypto-js';
export const md5 = function (msg: string): string {
  return CryptoJS.MD5(msg).toString();
};

// 获取url参数
export const getUrlParams = function (url: string): object {
  const search = url.split('?')[1] || '';
  const params = search.split('&');
  const result = {};
  params.forEach((item) => {
    const [key, value] = item.split('=');
    result[key] = value;
  });
  return result;
};
