import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_operator")
export class SysOperatorEntity extends HasPrimaryEntity {
  @Column("bigint", { name: "user_id", comment: "SaaS系统人员账号ID" })
  userId: string;
}

registerEntity({ entity: SysOperatorEntity });
