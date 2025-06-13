import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { SysRolePermissionEntity } from "../sys-role/entities/sys-role-permission.entity";
import { SysPermissionEntity } from "./entities/sys-permission.entity";
import { SysPermissionController } from "./sys-permission.controller";
import { SysPermissionService } from "./sys-permission.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: SysPermissionEntity,
      },
      {
        entity: SysRolePermissionEntity,
      },
    ]),
  ],
  controllers: [SysPermissionController],
  providers: [SysPermissionService],
})
export class SysPermissionModule {}
