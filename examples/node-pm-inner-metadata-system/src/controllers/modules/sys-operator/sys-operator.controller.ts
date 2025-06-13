import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { isEmpty } from "lodash";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { SysOperatorService } from "./sys-operator.service";

@Controller("sys-operator")
export class SysOperatorController {
  constructor(private readonly sysOperatorService: SysOperatorService) { }

  @Get(":phoneNumber/query-phone-user")
  queryPhoneUser(@Param("phoneNumber") phoneNumber: string) {
    if (!phoneNumber) {
      throw new CustomParameterException("手机号不能为空");
    }
    return this.sysOperatorService.queryPhoneUser(phoneNumber);
  }

  @ApiOperation({ summary: "查询用户列表" })
  @Post("query-params")
  queryOperatorList(@Body() body: any) {
    return this.sysOperatorService.queryOperatorList(body);
  }

  @ApiOperation({
    summary: "内部用户删除",
  })
  @Post("remove-operator-user")
  removeOperatorUser(@Body() body: any) {
    console.log("body", body);
    if (isEmpty(body)) {
      throw new CustomParameterException("请求参数不完整");
    }

    // 内部用户主键id
    if (isEmpty(body.sysOperatorId)) {
      throw new CustomParameterException("请求参数body.sysOperatorId 不完整");
    }

    // 用户id
    if (isEmpty(body.id)) {
      throw new CustomParameterException("请求参数body.id 不完整");
    }

    return this.sysOperatorService.removeOperatorUser(body);
  }
}
