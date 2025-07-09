import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity("dept")
export class DeptEntity extends HasPrimaryEntity {
  @Column({
    name: "dept_name",
    comment: "部门名称",
    type: "varchar",
    length: 125,
  })
  deptName: string;
}

// 注册实体到指定连接
registerEntity({ entity: DeptEntity });
