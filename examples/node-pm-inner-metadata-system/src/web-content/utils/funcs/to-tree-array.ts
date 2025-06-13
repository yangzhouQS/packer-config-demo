import { assign, forEach } from "lodash";

/* interface ITreeOptions {
  strict?: boolean;
  parentKey?: string;
  key?: string;
  children?: string;
  data?: string;

  [key: string]: any;
} */

const treeOptions = {
  parentKey: "parentId",
  key: "id",
  children: "children",
};

function unTreeList(result, parentItem, array, opts) {
  const optKey = opts.key;
  const optParentKey = opts.parentKey;
  const optChildren = opts.children;
  const optData = opts.data;
  const optUpdated = opts.updated;
  const optClear = opts.clear;
  forEach(array, (item) => {
    const childList = item[optChildren];
    if (optData) {
      item = item[optData];
    }
    if (optUpdated !== false) {
      item[optParentKey] = parentItem ? parentItem[optKey] : null;
    }
    result.push(item);
    if (childList && childList.length) {
      unTreeList(result, item, childList, opts);
    }
    if (optClear) {
      delete item[optChildren];
    }
  });
  return result;
}

/**
 * 将一个树结构转成数组列表
 *
 * @param {Array} array 数组
 * @param {object} options { children: 'children', data: 'data', clear: false }
 * @return {Array}
 */
export function toTreeArray(array, options = {}) {
  return unTreeList([], null, array, assign({}, treeOptions, options));
}
