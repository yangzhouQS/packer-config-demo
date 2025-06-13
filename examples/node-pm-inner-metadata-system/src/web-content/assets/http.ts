// 常量 登录地址
const LOGIN_ADDRESS = document.location.origin + '/cas/login.html';
// storage名称
const TOKEN_NAME = '__cstk';

// 自定义拦截器接口
interface ICSRequestInterceptors<T = AxiosResponse> {
  // 请求成功
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig
  // 请求失败
  requestInterceptorCatch?: (error: any) => any
  // 响应成功
  responseInterceptor?: (res: T) => T
  // 响应失败
  responseInterceptorCatch?: (error: any) => any
}
// 自定义请求配置接口，可选属性，可配可不配
interface ICSRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: ICSRequestInterceptors<T>
  data?: object
  method?: Method
  url?: string
  headers?: object
  timeout?: number
  baseURL?: string
  params?: object
  maxContentLength?: number
  validateStatus?: ((status: number) => boolean) | null | undefined
}

/**
 * 通用http请求
 */
export class CSRequest {
  instance: AxiosInstance;
  interceptors?: ICSRequestInterceptors;
  constructor (config?: ICSRequestConfig) {
    // 处理状态值
    if (!config) config = {};
    config.validateStatus = function (status: number) {
      switch (status) {
        case 401:
        case 402:
        case 403:
        case 408:
          // window.open(LOGIN_ADDRESS, '_self');
          return false;
      }
      return status > 100 && status < 300;
    };
    this.instance = axios.create(config);
    this.interceptors = config.interceptors;
    // 全局拦截 请求拦截器
    this.instance.interceptors.request.use(function (conf: ICSRequestConfig) {
      // 处理header
      const token = sessionStorage.getItem(TOKEN_NAME);
      if (token) {
        Object.assign(conf.headers, {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + token
        });
      }
      return conf;
    }, async function (err: any) {
      return await Promise.reject(err);
    });

    // 响应拦截器
    this.instance.interceptors.response.use(function (res: any) {
      
   
      return res;
    }, async function (err: any) {
      // 判断返回值如果是302，跳转到登录页
      if (err.response.data && err.response.data.code === 302) {
        window.open(err.response.data.redirectUrl, '_self');
      }
      return await Promise.reject(err);
    });
    // 实例级别拦截
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch
    );
    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch
    );
  }

  /**
   * 发起请求
   * @param config axios配置信息
   * @returns 返回结果
   */
  async request<T> (config?: ICSRequestConfig<T>): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
      // 请求拦截设置位置
      if (config?.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config);
      }
      this.instance
        .request<any, T>(config)
        .then((res: T) => {
          // 响应拦截设置位置
          if (config?.interceptors?.responseInterceptor) {
            res = config.interceptors.responseInterceptor(res);
          }
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  /**
   * get请求
   * @param url 请求地址
   * @param config 配置
   * @returns 返回结果
   */
  async get<T = any> (url: string, config?: ICSRequestConfig<T>): Promise<T> {
    return await this.request<T>({
      url,
      ...config,
      method: 'GET'
    });
  }

  /**
   * post请求
   * @param url 请求地址
   * @param data body参数
   * @param config 配置
   * @returns 返回结果
   */
  async post<T = any> (url: string, data: object, config?: ICSRequestConfig<T>): Promise<T> {
    return await this.request<T>({
      url,
      ...config,
      data,
      method: 'POST'
    });
  }

  /**
   * put请求
   * @param url 请求地址
   * @param data body参数
   * @param config 配置
   * @returns 返回结果
   */
  async put<T = any> (url: string, data: object, config?: ICSRequestConfig<T>): Promise<T> {
    return await this.request<T>({
      url,
      ...config,
      data,
      method: 'PUT'
    });
  }

  /**
   * delete请求
   * @param url 请求地址
   * @param data body参数
   * @param config 配置
   * @returns 返回结果
   */
  async delete<T = any> (url: string, data: object, config?: ICSRequestConfig<T>): Promise<T> {
    return await this.request<T>({
      url,
      ...config,
      data,
      method: 'DELETE'
    });
  }
}

// 请求实例方法
export const $http = function (config?: ICSRequestConfig): AxiosInstance {
  return new CSRequest(config);
};
