import { RpcClient } from "@cs/nest-cloud";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { isEmpty } from "lodash";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { CreateSysRoleDto } from "./dto/create-sys-role.dto";
import { SysRoleExtendService } from "./sys-role-extend.service";
import { SysRoleService } from "./sys-role.service";

@ApiTags("角色管理")
@Controller("sys-role")
export class SysRoleController {
  constructor(
    private readonly sysRoleService: SysRoleService,
    private readonly rpcClient: RpcClient,
    private readonly sysRoleExtendService: SysRoleExtendService,
  ) { }

  @Post()
  createRole(@Body() createSysRoleDto: CreateSysRoleDto) {
    return this.sysRoleService.createRole(createSysRoleDto);
  }

  @ApiOperation({ summary: "查询所有角色" })
  @Get("roles")
  queryRoles() {
    return this.sysRoleService.queryRoles();
  }

  @ApiOperation({ summary: "查询角色下所有权限项" })
  @HttpCode(HttpStatus.OK)
  @Get(":roleId/role-permissions")
  queryRolePermissions(@Param("roleId") roleId: string) {
    if (!roleId) {
      throw new CustomParameterException("角色ID不能为空");
    }
    return this.sysRoleService.queryRolePermissions(roleId);
  }

  @ApiOperation({ summary: "更新角色名称、备注和状态" })
  @Put(":roleId/update-role")
  updateRole(@Param("roleId") roleId: string, @Body() body: any) {
    if (!roleId) {
      throw new CustomParameterException("角色ID不能为空");
    }

    if (isEmpty(body)) {
      throw new CustomParameterException("更新参数不完整");
    }

    return this.sysRoleService.updateRole(roleId, body);
  }

  @ApiOperation({ summary: "删除角色" })
  @Delete(":roleId/remove-role")
  removeRole(@Param("roleId") roleId: string) {
    if (!roleId) {
      throw new CustomParameterException("角色ID不能为空");
    }
    return this.sysRoleService.removeRole(roleId);
  }

  @ApiOperation({ summary: "角色名称重复校验" })
  @Post("validate-role")
  validateRole(@Body() body: any) {
    if (isEmpty(body)) {
      throw new CustomParameterException("校验参数不完整");
    }

    return this.sysRoleService.validateRole(body);
  }

  @ApiOperation({
    summary: "根据产品id查询下属模块和权限项,构造模块和权限项树形结构",
  })
  @HttpCode(HttpStatus.OK)
  @Get(":productId/product/permissions")
  queryProductModulePermission(@Param("productId") productId: string) {
    return this.sysRoleExtendService.queryProductModulePermission(productId);
  }

  @ApiOperation({ summary: "删除角色权限项，根据权限项ID批量删除" })
  @Delete(":roleId/role-permission/delete")
  removeRolePermission(
    @Param("roleId") roleId: string,
    @Body()
    body: {
      permissions: {
        id: string;
        moduleId: string;
      }[];
    },
  ) {
    if (!roleId) {
      throw new HttpException("角色ID不能为空", HttpStatus.BAD_REQUEST);
    }

    if (!body.permissions || !Array.isArray(body.permissions)) {
      throw new HttpException(
        "权限项permissions不能为空",
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sysRoleExtendService.removeRolePermission(
      roleId,
      body.permissions,
    );
  }

  @ApiOperation({
    summary: "角色关联权限项",
  })
  @ApiBody({
    schema: {
      example: {
        roleId: 1,
        permissions: [
          {
            id: 1,
            moduleId: 666,
          },
        ],
      },
    },
  })
  @Post("role-relation-permission")
  rolePermission(@Body() body: any) {
    if (!body.roleId) {
      throw new HttpException("角色ID不能为空", HttpStatus.BAD_REQUEST);
    }

    if (!body.permissions || !Array.isArray(body.permissions)) {
      throw new HttpException(
        "角色分配权限项permissions不能为空",
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sysRoleExtendService.roleRelationPermission(body);
  }

  @ApiOperation({
    summary: "用户关联角色",
  })
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        roles: [
          {
            id: 1,
            description: 666,
          },
        ],
      },
    },
  })
  @Post("user-relation-role")
  userRelationRole(@Body() body: any) {
    if (!body.userId) {
      throw new CustomParameterException("用户body.userId不能为空");
    }

    if (isEmpty(body.roles) || !Array.isArray(body.roles)) {
      throw new CustomParameterException("分配角色body.roles 不能为空");
    }

    return this.sysRoleExtendService.userRelationRole(body);
  }

  @ApiOperation({
    summary: "删除用户关联的角色",
  })
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        roles: [
          {
            id: 1,
            description: 666,
          },
        ],
      },
    },
  })
  @Post("remove-user-roles")
  removeUserRelationRole(@Body() body: any) {
    if (!body.userId) {
      throw new CustomParameterException("用户body.userId不能为空");
    }

    if (isEmpty(body.roles) || !Array.isArray(body.roles)) {
      throw new CustomParameterException("删除角色body.roles 不能为空");
    }

    return this.sysRoleExtendService.removeUserRelationRole(body);
  }

  @ApiOperation({
    summary: "根据用户id查询分配的所有权限信息",
  })
  @Get(":userId/user-roles")
  findUserRoles(@Param("userId") userId: string) {
    if (!userId) {
      throw new CustomParameterException("用户userId不能为空");
    }

    return this.sysRoleExtendService.findUserRoles(userId);
  }
}
