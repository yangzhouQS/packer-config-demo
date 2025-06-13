import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_role")
export class SysRoleEntity extends HasPrimaryEntity {
  @Column("varchar", {
    name: "name",
    comment: "角色名称",
    length: 255,
  })
  name: string;

  @Column({
    type: "bool",
    name: "is_disabled",
    comment: "禁用",
    width: 1,
    default: false,
  })
  isDisabled: boolean;

  @Column("varchar", {
    name: "description",
    nullable: true,
    comment: "角色描述",
    length: 255,
  })
  description: string | null;
}

registerEntity({ entity: SysRoleEntity });
