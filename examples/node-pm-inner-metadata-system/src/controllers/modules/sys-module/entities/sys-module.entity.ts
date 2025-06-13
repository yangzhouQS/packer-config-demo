import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_module")
export class SysModuleEntity extends HasPrimaryEntity {
  @Column("varchar", { name: "code", comment: "模块编码", length: 100 })
  code: string;

  @Column("varchar", { name: "name", comment: "模块名称", length: 50 })
  name: string;

  /* @Column("varchar", {
    name: "app_type",
    comment: "mobile移动端，web pc",
    length: 10,
    default: () => "'web'",
  })
  appType: string; */

  @Column("varchar", {
    name: "module_type",
    comment: "url外部 / internal一般页面",
    length: 20,
  })
  moduleType: string;

  @Column("varchar", {
    name: "url",
    nullable: true,
    comment: "模块地址",
    length: 1000,
  })
  url: string | null;

  @Column("bigint", { name: "product_id", comment: "关联产品id" })
  productId: string;

  @Column("varchar", { name: "icon", comment: "菜单图标", length: 125 })
  icon: string;

  @Column("int", {
    name: "sort_code",
    comment: "菜单顺序",
    default: () => "'0'",
  })
  sortCode: number;

  @Column({
    type: "boolean",
    name: "is_disabled",
    comment: "禁用",
    width: 1,
    default: () => "'0'",
  })
  isDisabled: boolean;

  @Column({
    type: "boolean",
    name: "is_visible",
    comment: "隐藏标识",
    width: 1,
    default: () => "'0'",
  })
  isVisible: boolean;

  @Column("tinyint", {
    name: "is_default",
    comment: "产品默认菜单",
    width: 1,
    default: () => "'0'",
  })
  isDefault: boolean;

  @Column("bigint", { name: "parent_id", comment: "上级模块id" })
  parentId: string;

  @Column("varchar", {
    name: "type",
    comment: "类型，group分组，module模块",
    length: 64,
  })
  type: string;

  @Column("int", {
    name: "level",
    comment: "层级",
    default: 1,
  })
  level: number;

  @Column("varchar", { name: "full_id", comment: "id全称", length: 1000 })
  fullId: string;

  @Column("varchar", { name: "full_name", comment: "名称全称", length: 2000 })
  fullName: string;

  @Column({ type: "bool", name: "is_leaf", comment: "叶子节点", width: 1 })
  isLeaf: boolean;
}

registerEntity({ entity: SysModuleEntity });
