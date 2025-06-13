import { assign, forEach } from "lodash";
// var helperCreateTreeFunc = require('./helperCreateTreeFunc')
// var arrayEach = require('./arrayEach')

// var assign = require('./assign')

function helperCreateTreeFunc(handle) {
  return function (obj, iterate, options, context) {
    const opts = options || {};
    const optChildren = opts.children || "children";
    return handle(null, obj, iterate, context, [], [], optChildren, opts);
  };
}

function searchTreeItem(matchParent, parent, obj, iterate, context, path, node, parseChildren, opts) {
  let paths, nodes, rest, isMatch, hasChild;
  const rests = [];
  const hasOriginal = opts.original;
  const sourceData = opts.data;
  const mapChildren = opts.mapChildren || parseChildren;
  const isEvery = opts.isEvery;
  // arrayEach(obj, function (item, index) {
  forEach(obj, (item, index) => {
    paths = path.concat([`${index}`]);
    nodes = node.concat([item]);
    isMatch = (matchParent && !isEvery) || iterate.call(context, item, index, obj, paths, parent, nodes);
    hasChild = parseChildren && item[parseChildren];
    if (isMatch || hasChild) {
      if (hasOriginal) {
        rest = item;
      }
      else {
        rest = assign({}, item);
        if (sourceData) {
          rest[sourceData] = item;
        }
      }
      rest[mapChildren] = searchTreeItem(isMatch, item, item[parseChildren], iterate, context, paths, nodes, parseChildren, opts);
      if (isMatch || rest[mapChildren].length) {
        rests.push(rest);
      }
    }
    else if (isMatch) {
      rests.push(rest);
    }
  });
  return rests;
}

/**
 * 从树结构中根据回调查找数据
 *
 * @param {object} obj 对象/数组
 * @param {Function} iterate(item, index, items, path, parent, nodes) 回调
 * @param {object} options {children: 'children'}
 * @param {object} context 上下文
 * @return {Array}
 */
export const searchTree = helperCreateTreeFunc((parent, obj, iterate, context, path, nodes, parseChildren, opts) => {
  return searchTreeItem(0, parent, obj, iterate, context, path, nodes, parseChildren, opts);
});
