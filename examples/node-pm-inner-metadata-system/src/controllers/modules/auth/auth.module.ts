import { Argon2Utils } from "@cs/nest-common";
import { CustomRepository, EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {
  UserEntity,
} from "./entities/user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: UserEntity,
        repository: CustomRepository,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, Argon2Utils],
  exports: [Argon2Utils],
})
export class AuthModule {}
