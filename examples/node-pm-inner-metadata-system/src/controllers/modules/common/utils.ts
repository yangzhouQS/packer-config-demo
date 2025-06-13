import { HttpException, HttpStatus } from "@nestjs/common";
import { camelCase, get } from "lodash";

export function transField(rows: any[]) {
  if (!Array.isArray(rows)) {
    return rows;
  }
  return rows.map((item: Record<string, any>) => {
    const o = {};
    for (const itemKey in item) {
      o[camelCase(itemKey)] = item[itemKey];
    }
    return o;
  });
}

export async function idGen(num = 1) {
  let result;
  try {
    result = await this.rpcClient.getNewId(num);
  }
  catch (error) {
    console.log(error);
    try {
      result = await this.rpcClient.getNewId(num);
    }
    catch (err) {
      console.log(err);
      throw new HttpException("ID依赖服务调用错误", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  if (num === 1) {
    return get(result, "0");
  }
  return result;
}
