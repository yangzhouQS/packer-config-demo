import { Argon2Utils } from "@cs/nest-common";
import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { UserEntity } from "../auth/entities/user.entity";
import { SysOperatorEntity } from "../sys-operator/entities/sys-operator.entity";
import { SysPermissionEntity } from "../sys-permission/entities/sys-permission.entity";
import { SysRolePermissionEntity } from "./entities/sys-role-permission.entity";
import { SysRoleEntity } from "./entities/sys-role.entity";
import { SysUserRoleEntity } from "./entities/sys-user-role.entity";
import { SysRoleExtendService } from "./sys-role-extend.service";
import { SysRoleController } from "./sys-role.controller";
import { SysRoleService } from "./sys-role.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: SysRoleEntity,
      },
      {
        entity: SysUserRoleEntity,
      },
      {
        entity: SysPermissionEntity,
      },
      {
        entity: SysRolePermissionEntity,
      },
      {
        entity: UserEntity,
      },
      {
        entity: SysOperatorEntity,
      },
    ]),
  ],
  controllers: [SysRoleController],
  providers: [SysRoleService, SysRoleExtendService, Argon2Utils],
  exports: [SysRoleService],
})
export class SysRoleModule { }
