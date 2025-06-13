import { assign, clone, each, isNull, orderBy, remove } from "lodash";

/*

// 测试数据
const data = {
  code: 200,
  status: "success",
  message: "",
  result: [
    {
      type: "product",
      id: "872547949364224",
      name: "测试产品类型44",
      code: "test-code44",
      productType: "mobile",
      parentId: "-1",
      sortCode: 0,
      productId: "-1",
    },
    {
      type: "group",
      id: "11",
      name: "分组1",
      code: "code1",
      productType: "",
      parentId: "805883463107584",
      sortCode: 0,
      productId: "805883463107584",
    },
    {
      type: "module",
      id: "12",
      name: "菜单1",
      code: "code1-aaaaaa",
      productType: "",
      parentId: "11",
      sortCode: 0,
      productId: "805883463107584",
    },
    {
      type: "module",
      id: "818334214259712",
      name: "后台用户管理",
      code: "pm-inner-metadata-inerr-user",
      productType: "",
      parentId: "805883463107584",
      sortCode: 0,
      productId: "805883463107584",
    },
    {
      type: "module",
      id: "850822098748416",
      name: "A测试",
      code: "aaaa",
      productType: "",
      parentId: "806241343636480",
      sortCode: 0,
      productId: "806241343636480",
    },
    {
      type: "product",
      id: "806241343636480",
      name: "本地测试系统",
      code: "inner-metadata-test",
      productType: "web",
      parentId: "-1",
      sortCode: 1,
      productId: "-1",
    },
    {
      type: "product",
      id: "850814625399808",
      name: "元数据管理系统",
      code: "pm-matadata",
      productType: "web",
      parentId: "-1",
      sortCode: 1,
      productId: "-1",
    },
    {
      type: "product",
      id: "865692208497664",
      name: "测试产品类型",
      code: "test-code222",
      productType: "mobile",
      parentId: "-1",
      sortCode: 1,
      productId: "-1",
    },
    {
      type: "module",
      id: "808567084041216",
      name: "产品管理",
      code: "pm-inner-metadata-product",
      productType: "",
      parentId: "805883463107584",
      sortCode: 1,
      productId: "805883463107584",
    },
    {
      type: "module",
      id: "808595352863744",
      name: "权限管理",
      code: "pm-inner-metadata-product",
      productType: "",
      parentId: "805883463107584",
      sortCode: 6,
      productId: "805883463107584",
    },
    {
      type: "product",
      id: "805883463107584",
      name: "内部系统元数据",
      code: "pm-inner-metadata",
      productType: "web",
      parentId: "-1",
      sortCode: 11,
      productId: "-1",
    },
  ],
};
*/

function strictTree(array, optChildren) {
  each(array, (item) => {
    if (item[optChildren] && !item[optChildren].length) {
      remove(item, optChildren);
    }
  });
}

const treeOptions = {
  parentKey: "parentId",
  key: "id",
  children: "children",
  strict: false,
  sortKey: "sortCode",
  reverse: false,
  data: null,
};

/**
 * 将一个带层级的数据列表转成树结构
 *
 * @param {Array} array 数组
 * @param {object} options {strict: false, parentKey: 'parentId', key: 'id', children: 'children', mapChildren: 'children', data: 'data'}
 * @return {Array}
 */
export function toArrayTree(array, options = {}) {
  const opts = assign({}, treeOptions, options);
  const optStrict = opts.strict;
  const optKey = opts.key;
  const optParentKey = opts.parentKey;
  const optChildren = opts.children;
  // var optMapChildren = opts.mapChildren
  const optSortKey = opts.sortKey;
  const optReverse = opts.reverse || false;
  const optData = opts.data || null;
  const result = [];
  const treeMap = {};
  const idsMap = {};
  let id, treeData, parentId;

  // 排序
  if (optSortKey) {
    array = orderBy(clone(array), optSortKey);
    if (optReverse) {
      array = array.reverse();
    }
  }

  // 唯一键映射
  each(array, (item) => {
    id = item[optKey];
    idsMap[id] = true;
  });

  each(array, (item) => {
    id = item[optKey];

    if (optData) {
      treeData = {};
      treeData[optData] = item;
    }
    else {
      treeData = item;
    }

    parentId = item[optParentKey];
    treeMap[id] = treeMap[id] || [];
    treeData[optKey] = id;
    treeData[optParentKey] = parentId;

    if (id === parentId) {
      parentId = null;
      console.log("Fix infinite Loop.", item);
    }

    treeMap[parentId] = treeMap[parentId] || [];
    treeMap[parentId].push(treeData);
    treeData[optChildren] = treeMap[id];
    /* if (optMapChildren) {
      treeData[optMapChildren] = treeMap[id]
    } */

    if (!optStrict || (optStrict && isNull(parentId))) {
      if (!idsMap[parentId]) {
        result.push(treeData);
      }
    }
  });

  if (optStrict) {
    strictTree(array, optChildren);
  }

  return result;
}
