import { EntityRegistModule } from "@cs/nest-typeorm";
import { Module } from "@nestjs/common";
import { DeptEntity } from "./entities/dept.entity";
import { ReceiveEntity } from "./entities/receive.entity";
import { UserTestController } from "./user-test.controller";
import { UserTestService } from "./user-test.service";

@Module({
  imports: [
    EntityRegistModule.forRepos([
      {
        entity: DeptEntity,
      },
      {
        entity: ReceiveEntity,
      },
    ]),
  ],
  controllers: [UserTestController],
  providers: [UserTestService],
})
export class UserTestModule {}
