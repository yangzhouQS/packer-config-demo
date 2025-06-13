import EventEmitter from "eventemitter2";

export type IPublicTypeDisposable = () => void;
export interface OneCallBackType {
  once?: boolean;
  resolve: (data: any) => void;
}
export interface IPublicApiEvent {
  /**
   * 监听事件
   * add monitor to a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  on: (event: string, listener: (...args: any[]) => void) => IPublicTypeDisposable;

  /**
   * 取消监听事件
   * cancel a monitor from a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  off: (event: string, listener: (...args: any[]) => void) => void;

  /**
   * 触发事件
   * emit a message fot a event
   * @param event 事件名称
   * @param args 事件参数
   * @returns
   */
  emit: (event: string, ...args: any[]) => void;
}

export type KeyType = (new (...args: any[]) => any) | symbol | string;
export type ClassType = new (...args: any[]) => any;

export interface GetOptions {
  forceNew?: boolean;
  sourceCls?: ClassType;
}

export type GetReturnType<T, ClsType> = T extends undefined
  ? ClsType extends {
    prototype: infer R;
  }
    ? R
    : any
  : T;

export interface IEventBus extends IPublicApiEvent {
  removeListener: (event: string | symbol, listener: (...args: any[]) => void) => any;

  addListener: (event: string | symbol, listener: (...args: any[]) => void) => any;

  // 设置监听数量
  setMaxListeners: (n: number) => any;

  // 获取监听数量
  getMaxListeners: () => number;

  removeAllListeners: (event?: string | symbol) => any;
}

export class EventBus implements IEventBus {
  private readonly context = new Map<KeyType, any>();
  private readonly eventEmitter: EventEmitter;
  private readonly name?: string;
  private _len = 0;
  eventMap = {};

  get<T = undefined, KeyOrType = any>(keyOrType: KeyOrType): GetReturnType<T, KeyOrType> | undefined {
    return this.context.get(keyOrType as any);
  }

  set(key: KeyType, data: any): void | Promise<void> {
    this.context.set(key, data);
    this.notify(key);
  }

  has(keyOrType: KeyType): boolean {
    return this.context.has(keyOrType);
  }

  onGot<T = undefined, KeyOrType extends KeyType = any>(
    keyOrType: KeyOrType,
    fn: (data: GetReturnType<T, KeyOrType>) => void,
  ): () => void {
    const arg = this.context.get(keyOrType);
    if (arg !== undefined) {
      fn(arg);
      return () => {
      };
    }
    else {
      this.setWait(keyOrType, fn);
      return () => {
        this.delWait(keyOrType, fn);
      };
    }
  }

  async onceGot<T = undefined, KeyOrType extends KeyType = any>(keyOrType: KeyOrType): Promise<GetReturnType<T, KeyOrType>> {
    const x = this.context.get(keyOrType);
    if (x !== undefined) {
      return await Promise.resolve(x);
    }
    return await new Promise((resolve) => {
      this.setWait(keyOrType, resolve, true);
    });
  }

  // -------------------------异步获取配置-------------------------------------
  private readonly waits = new Map<KeyType, OneCallBackType[]>();

  private setWait(key: KeyType, resolve: (data: any) => void, once?: boolean) {
    const waits = this.waits.get(key) ?? [];
    if (this.waits.has(key)) {
      waits.push({ resolve, once });
    }
    else {
      // 第一次处理
      this.waits.set(key, [{ resolve, once }]);
    }
  }

  private notify(key: KeyType) {
    if (!this.waits.has(key))
      return;
    let waits = this.waits.get(key) ?? [];
    waits = waits.slice().reverse(); // 复制反转

    let index = waits.length;

    while (index--) {
      waits[index].resolve(this.get(key));
      if (waits[index].once) {
        waits.splice(index, 1);
      }
    }

    if (waits.length > 0) {
      this.waits.set(key, waits);
    }
    else {
      this.waits.delete(key);
    }
  }

  private delWait(key: KeyType, fn: any) {
    const waits = this.waits.get(key);
    if (!waits) {
      return;
    }
    let i = waits.length;
    while (i--) {
      if (waits[i].resolve === fn) {
        waits.splice(i, 1);
      }
    }
    if (waits.length < 1) {
      this.waits.delete(key);
    }
  }

  /**
   * 内核触发的事件名
   */
  readonly names = [];

  constructor(emitter: EventEmitter, name?: string) {
    this.eventEmitter = emitter;
    this.name = name;

    if (!this.name) {
      console.warn("prefix is required while initializing Event", `[${this.name ?? "事件名称"}]`);
    }
  }

  private getMsgPrefix(type: string): string {
    if (this.name && this.name.length > 0) {
      return `[${this.name}][event-${type}]`;
    }
    else {
      return `[*][event-${type}]`;
    }
  }

  /**
   * 监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  on(event: string, listener: (...args: any[]) => void): () => void {
    /* if (this.eventMap[event]) {
      this.eventMap[event] += 1;
    } else {
      this.eventMap[event] = 1;
    }
    console.log('-----', this.name, event, this.eventMap[event],); */

    this.eventEmitter.on(event, listener);
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * 取消监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  off(event: string, listener: (...args: any[]) => void) {
    /* if (this.eventMap[event]) {
      this.eventMap[event] = this.eventMap[event] - 1;
    } */
    this.eventEmitter.off(event, listener);
  }

  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param args 事件参数
   */
  emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }

  removeListener(event: string | symbol, listener: (...args: any[]) => void): any {
    return this.eventEmitter.removeListener(event, listener);
  }

  addListener(event: string | symbol, listener: (...args: any[]) => void): any {
    return this.eventEmitter.addListener(event, listener);
  }

  setMaxListeners(n: number): any {
    this.eventEmitter.setMaxListeners(n);
  }

  getMaxListeners(): number {
    return this.eventEmitter.getMaxListeners();
  }

  removeAllListeners(event?: string | symbol): any {
    return this.eventEmitter.removeAllListeners(event);
  }
}

export function createModuleEventBus(moduleName: string, maxListeners?: number): IEventBus {
  const emitter = new EventEmitter();
  if (maxListeners) {
    emitter.setMaxListeners(maxListeners);
  }
  return new EventBus(emitter, moduleName);
}
