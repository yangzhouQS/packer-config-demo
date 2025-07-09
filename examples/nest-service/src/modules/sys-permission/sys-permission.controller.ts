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
import { SysPermissionService } from "./sys-permission.service";

@ApiTags("sys-permission:权限项管理")
@Controller("sys-permission")
export class SysPermissionController {
  constructor(private readonly sysPermissionService: SysPermissionService) {}

  @Post()
  create(@Body() body: any) {
    if (!body.moduleId) {
      throw new CustomParameterException("body.moduleId参数不完整");
    }
    return this.sysPermissionService.create(body);
  }

  @Get()
  findAll(@Query("moduleId") moduleId: string) {
    if (!moduleId) {
      throw new CustomParameterException("moduleId参数不完整");
    }
    return this.sysPermissionService.findAll(moduleId);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    if (!id) {
      throw new CustomParameterException("id参数不完整");
    }
    return this.sysPermissionService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    if (!id) {
      throw new CustomParameterException("id参数不完整");
    }
    return this.sysPermissionService.remove(id);
  }

  @ApiOperation({ summary: "校验权限是否重复" })
  @Post("validate-permission")
  validatePermission(@Body() body: any) {
    if (isEmpty(body) || isEmpty(body.data)) {
      throw new CustomParameterException("校验参数不完整");
    }
    if (isEmpty(body.field)) {
      throw new CustomParameterException("body.field 参数不完整");
    }

    return this.sysPermissionService.validatePermission(body);
  }
}
