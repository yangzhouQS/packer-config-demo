import { Argon2Utils } from "@cs/nest-common";
import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { UserEntity } from "../auth/entities/user.entity";
import { SysOperatorEntity } from "../sys-operator/entities/sys-operator.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: UserEntity,
      },
      {
        entity: SysOperatorEntity,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, Argon2Utils],
  exports: [UserService],
})
export class UserModule { }
