import {bootstrap} from "@cs/nest-cloud";
import {AppModule} from "./app.module";
import {items} from './demo-test'

const os = require('os');

// 格式化内存大小（将字节转换为更友好的单位）
function formatMemory(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// 获取并打印内存信息
function printMemoryInfo() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

  // 获取 Node.js 进程内存使用情况
  const processMemory = process.memoryUsage();

  console.log('==== 系统内存信息 ====');
  console.log(`总内存: ${formatMemory(totalMemory)}`);
  console.log(`空闲内存: ${formatMemory(freeMemory)}`);
  console.log(`已使用内存: ${formatMemory(usedMemory)} (${memoryUsagePercentage}%)`);

  console.log('\n==== Node.js 进程内存使用 ====');
  console.log(`RSS (驻留集大小): ${formatMemory(processMemory.rss)}`);
  console.log(`堆总大小: ${formatMemory(processMemory.heapTotal)}`);
  console.log(`堆使用大小: ${formatMemory(processMemory.heapUsed)}`);
  console.log(`外部内存: ${formatMemory(processMemory.external)}`);

  if (processMemory.arrayBuffers) {
    console.log(`ArrayBuffer 内存: ${formatMemory(processMemory.arrayBuffers)}`);
  }
}

// 立即执行内存信息打印
// printMemoryInfo();

// 可选：设置定时器，每5秒更新一次内存信息
// setInterval(printMemoryInfo, 5000);

import fse from 'fs-extra'

let count = 0
/*setInterval(() => {
  const time = new Date().toLocaleString()
  const writeContent = `export const items = {time:'${time}',count:${++count}}`
  fse.writeFileSync('./src/controllers/test-time.txt', `${time}`);
  fse.writeFileSync('./src/controllers/demo-test.ts', writeContent);
  // printMemoryInfo();
  console.log('writeContent = ', writeContent);
}, 4000)*/


bootstrap(AppModule, async (app, config) => {
  // 服务启动后可以干点事情
  const conf = config.get("name");

  console.log(conf, '111111');
  console.log('test-items = ', items);
});
