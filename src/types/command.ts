export type CommandTypeOptions = {
  root?: string;
  /**
   * 配置文件路径
   */
  config?: string;
  /**
  * 监听模式
  * */
  watch?: boolean;
  /**
   * 环境变量，默认为 development
   */
  env?: string;
  /*
  * tsconfig.json 的路径
  * */
  path?: string;

  /**
   * 启动打包的模块
   */
  include?: string;

  /**
   * 是否开启调试模式
   */
  debug?: boolean;

  /**
   * 执行打包后的文件命令
   */
  exec?: boolean;


  /**
   * 是否开启类型检查
   */
  typeCheck?: boolean;
};

