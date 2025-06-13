import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_permission")
export class SysPermissionEntity extends HasPrimaryEntity {
  @Column("varchar", { name: "name", comment: "权限名称", length: 125 })
  name: string;

  @Column("varchar", { name: "code", comment: "产品编码", length: 255 })
  code: string;

  @Column("varchar", {
    name: "description",
    comment: "权限项描述",
    length: 125,
  })
  description: string;

  @Column("bigint", { name: "module_id", comment: "关联模块ID" })
  moduleId: string;
}

registerEntity({ entity: SysPermissionEntity });
