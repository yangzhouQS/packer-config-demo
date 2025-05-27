#!/usr/bin/env node
let target = process.argv[2]
const packageConfig = require('../package.json')
if (!target) {
  console.error('缺少 拷贝目标路径参数！')
  return
}
const rslog = require('rslog')

let copyfile = ['dist', 'README.md', 'bin', 'package.json', 'compiled']
const path = require('path')
const fs = require('fs-extra')
// 清空 dist
// console.log('-------------清空 dist----------------', path.resolve(__dirname, `../publish/${target}/dist`))
console.log(path.resolve(target));

if (!fs.pathExistsSync(target)) {
  console.log('路径不存在，停止拷贝');
  process.exit(0);
}

function basePath(pathName) {
  return path.resolve(__dirname, `../${pathName}`);
}

function targetPath(pathName) {
  return path.resolve(target, pathName);
}

/*
* 1. 清空目标文件夹
* 2. 拷贝文件
* */
copyfile.forEach(async (filename) => {
  const stats = await fs.stat(basePath(`${filename}`));
  // 判断是文件还是目录
  if (stats.isDirectory()) {
    fs.emptyDirSync(targetPath(`${filename}`));
    // console.log(targetPath(`${filename}`));
  } else if (stats.isFile()) {
    // console.log(`${filename} 是一个文件`);
    // console.log(targetPath(`${filename}`));
    fs.removeSync(targetPath(`${filename}`));
  } else {
    console.log(`${filename} 既不是文件也不是目录`);
  }
});

console.log('文件夹清空完成,------------开始拷贝文件------------------');

copyfile.forEach(async (filename) => {
  fs.copy(basePath(filename), targetPath(filename)).then(
    () => {
      console.log(`${target}/${filename} ----------- 写入成功`)
    }
  )
});



/*fs.emptyDirSync(path.resolve(__dirname, `../publish/${target}/dist`))

// 删除主题样式文件夹下的packages和styles
fs.removeSync(path.resolve(__dirname, `../dist/themes/packages`))
fs.removeSync(path.resolve(__dirname, `../dist/themes/styles`))
fs.removeSync(path.resolve(__dirname, `../dist/themes/index-yearrow.js`))

// 拷贝主题文件至文档站点下
fs.emptyDirSync(path.resolve(__dirname, `../src/sites/assets/themes`))
fs.copySync(path.resolve(__dirname, '../dist/themes'), path.resolve(__dirname, `../src/sites/assets/themes`))

copyfile.forEach((filename) => {
  fs.copy(path.resolve(__dirname, `../${filename}`), path.resolve(__dirname, `../publish/${target}/${filename}`)).then(
    () => {
      console.log(`write success=> publish/${target}/${filename}`)
    }
  )
})

const targetPkgPath = path.resolve(__dirname, `../publish/${target}/package.json`)
const targetPkgStr = fs.readFileSync(targetPkgPath)
const targetPkgObj = JSON.parse(targetPkgStr)
targetPkgObj.version = packageConfig.version
fs.outputFile(targetPkgPath, JSON.stringify(targetPkgObj, null, 2), 'utf8', () => {
  console.log(`${targetPkgPath} 写入成功`)
})*/

/*
fs.emptyDirSync(path.resolve(__dirname, `../publish/${target}/dist`))
copyfile.forEach((filename) => {
  fs.copy(path.resolve(__dirname, `../${filename}`), path.resolve(__dirname, `../publish/${target}/${filename}`)).then(
    () => {
      console.log(`publish/${target}/${filename} 写入成功`)
    }
  )
})
const targetPkgPath = path.resolve(__dirname, `../publish/${target}/package.json`)
const targetPkgStr = fs.readFileSync(targetPkgPath)
const targetPkgObj = JSON.parse(targetPkgStr)
targetPkgObj.version = packageConfig.version
fs.outputFile(targetPkgPath, JSON.stringify(targetPkgObj, null, 2), 'utf8', () => {
  console.log(`${targetPkgPath} 写入成功`)
})
*/
