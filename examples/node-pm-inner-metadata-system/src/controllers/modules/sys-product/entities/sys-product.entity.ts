import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("sys_product")
export class SysProductEntity extends HasPrimaryEntity {
  @Column("varchar", { name: "name", comment: "产品名称", length: 50 })
  name: string;

  @Column("varchar", { name: "code", comment: "产品编码", length: 50 })
  code: string;

  @Column("varchar", {
    name: "product_type",
    comment: "mobile移动端，web pc",
    length: 50,
    default: "web",
  })
  productType: string;

  @Column({
    type: "bool",
    name: "is_disabled",
    comment: "禁用,禁用后产品无法被用户使用",
    width: 1,
    default: false,
  })
  isDisabled: boolean;

  @Column("varchar", { name: "icon", comment: "产品图标", length: 125 })
  icon: string;

  @Column("int", {
    name: "sort_code",
    nullable: true,
    comment: "排序",
    default: 1,
  })
  sortCode: number;
}

registerEntity({ entity: SysProductEntity });
