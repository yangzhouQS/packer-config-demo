import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_role_permission")
export class SysRolePermissionEntity extends HasPrimaryEntity {
  @Column("bigint", { name: "role_id", comment: "角色id" })
  roleId: string;

  @Column("bigint", { name: "permission_id", comment: "权限项id" })
  permissionId: string;

  @Column("bigint", { name: "module_id", comment: "权限项所在的模块id" })
  moduleId: string;
}

registerEntity({ entity: SysRolePermissionEntity });
