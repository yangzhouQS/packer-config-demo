import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_user_role")
export class SysUserRoleEntity extends HasPrimaryEntity {
  @Column("bigint", { name: "user_id", comment: "用户ID" })
  userId: string;

  @Column("bigint", { name: "role_id", comment: "角色ID" })
  roleId: string;
}

registerEntity({ entity: SysUserRoleEntity });
