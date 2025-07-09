import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("receive")
export class ReceiveEntity extends HasPrimaryEntity {
  @Column({
    name: "name",
    comment: "姓名",
    type: "varchar",
    length: 50,
  })
  name: string;
}

// 注册实体到指定连接
registerEntity({ entity: ReceiveEntity });
