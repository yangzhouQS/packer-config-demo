import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { UserEntity } from "../auth/entities/user.entity";
import { SysUserRoleEntity } from "../sys-role/entities/sys-user-role.entity";
import { SysOperatorEntity } from "./entities/sys-operator.entity";
import { SysOperatorController } from "./sys-operator.controller";
import { SysOperatorService } from "./sys-operator.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: SysOperatorEntity,
      },
      {
        entity: UserEntity,
      },
      {
        entity: SysUserRoleEntity,
      },
    ]),
  ],
  controllers: [SysOperatorController],
  providers: [SysOperatorService],
})
export class SysOperatorModule {}
