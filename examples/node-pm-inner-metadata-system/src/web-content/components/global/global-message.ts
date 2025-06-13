import { ElMessage } from "element-plus";

const messageOpt = {
  zIndex: 2222,
  customClass: "global-message-z-index",
};

// success' | 'warning' | 'info' | 'error'
export class GlobalMessage {
  static message(options = {}, isClose = true) {
    if (isClose) {
      ElMessage.closeAll();
    }
    ElMessage(options);
  }

  static success(message: string, options = {}, isClose = true) {
    if (isClose) {
      ElMessage.closeAll();
    }
    const opt = Object.assign(
      messageOpt,
      {
        type: "success",
        message,
      },
      options,
    );
    ElMessage.success(opt);
  }

  static warning(message: string, options = {}, isClose = true) {
    if (isClose) {
      ElMessage.closeAll();
    }
    const opt = Object.assign(
      messageOpt,
      {
        type: "warning",
        message,
      },
      options,
    );
    ElMessage.warning(opt);
  }

  static info(message: string, options = {}, isClose = true) {
    if (isClose) {
      ElMessage.closeAll();
    }
    const opt = Object.assign(
      messageOpt,
      {
        type: "info",
        message,
      },
      options,
    );
    ElMessage.info(opt);
  }

  static error(message: string, options = {}, isClose = true) {
    if (isClose) {
      ElMessage.closeAll();
    }
    const opt = Object.assign(
      messageOpt,
      {
        type: "error",
        message,
      },
      options,
    );
    ElMessage.error(opt);
  }
}
