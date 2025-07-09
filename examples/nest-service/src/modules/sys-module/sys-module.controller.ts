import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { isEmpty } from "lodash";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { SysModuleService } from "./sys-module.service";

@ApiTags("sys-module:模块管理")
@Controller("sys-module")
export class SysModuleController {
  constructor(private readonly sysModuleService: SysModuleService) {}

  @ApiOperation({ summary: "创建模块" })
  @Post()
  createModule(@Body() body: any) {
    if (!body || isEmpty(body)) {
      throw new CustomParameterException("创建参数不完整");
    }

    /* if (!body.parentData || isEmpty(body.parentData)){
      throw new CustomParameterException("body.parentData 参数不完整");
    } */

    return this.sysModuleService.createModule(body);
  }

  @Get()
  findAll() {
    return this.sysModuleService.findAll();
  }

  @Get("query")
  findOne(@Query("id") id: string) {
    return this.sysModuleService._findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    if (!id) {
      throw new CustomParameterException("id参数不完整");
    }
    if (isEmpty(body)) {
      throw new CustomParameterException("更新参数不完整");
    }
    return this.sysModuleService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sysModuleService.remove(id);
  }
}
