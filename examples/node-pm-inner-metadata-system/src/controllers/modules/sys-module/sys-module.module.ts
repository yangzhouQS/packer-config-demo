import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { SysPermissionEntity } from "../sys-permission/entities/sys-permission.entity";
import { SysProductEntity } from "../sys-product/entities/sys-product.entity";
import { SysModuleEntity } from "./entities/sys-module.entity";
import { SysModuleController } from "./sys-module.controller";
import { SysModuleService } from "./sys-module.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: SysModuleEntity,
      },
      {
        entity: SysProductEntity,
      },
      {
        entity: SysPermissionEntity,
      },
    ]),
  ],
  controllers: [SysModuleController],
  providers: [SysModuleService],
})
export class SysModuleModule {}
