import { RpcClient } from "@cs/nest-cloud";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { DeptEntity } from "./entities/dept.entity";
import { ReceiveEntity } from "./entities/receive.entity";

@Injectable()
export class UserTestService {
  constructor(
    @InjectRepository({
      entity: DeptEntity,
    })
    private readonly _deptEntityRepository: CustomRepository<DeptEntity>,
    @InjectRepository({
      entity: ReceiveEntity,
    })
    private readonly _receiveEntityRepository: CustomRepository<ReceiveEntity>,
    private readonly rpcClient: RpcClient,
  ) {}

  async create() {
    const receiveData = {
      name: "receive",
    };
    const deptData = {
      deptName: "deptxxxxx",
    };
    // Object.assign(deptData,{})
    console.log("deptData------------");
    await this._receiveEntityRepository.manager.transaction(async (manager) => {
      /* const receive = manager.create(ReceiveEntity, receiveData);
      const dept = manager.create(DeptEntity, deptData);
      await manager.save(receive);
      await manager.save(dept); */

      await manager.save(DeptEntity, { deptName: "a11", id: "4" });
      await manager.save(DeptEntity, { deptName: "deptxxxxx", id: "5" });

      // await this._receiveEntityRepository.updateByCondition(receiveData, { id: "1" });
      // await this._deptEntityRepository.saveOne({ deptName: "a11" });
      // await this._deptEntityRepository.updateByCondition(deptData, { id: "1" });
      // await this._receiveEntityRepository.saveOne(receiveData);
      // await this._deptEntityRepository.saveOne(deptData);
    });
    return "This action adds a new userTest";
  }

  async findAll() {
    /* return await this._userRepository.find({
      select: ["id", "name", "gender", "loginId", "phoneNumber", "remark"],
      order: {
        createdAt: "asc",
      },
      where: {
        isRemoved: false,
      },
    }); */
  }

  async testUserById() {
    /* const sql = `
        select * from user where id > :id
        union all
        select * from user where id > :id
`;

    return await this.rpcClient.getNewId(99);
    return await this._userRepository.executeSql(sql, { id: 1 }); */
  }
}
