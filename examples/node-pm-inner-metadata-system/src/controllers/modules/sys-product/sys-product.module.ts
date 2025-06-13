import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { SysModuleEntity } from "../sys-module/entities/sys-module.entity";
import { SysProductEntity } from "./entities/sys-product.entity";
import { SysProductController } from "./sys-product.controller";
import { SysProductService } from "./sys-product.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: SysProductEntity,
      },
      {
        entity: SysModuleEntity,
      },
    ]),
  ],
  controllers: [SysProductController],
  providers: [SysProductService],
})
export class SysProductModule {}
