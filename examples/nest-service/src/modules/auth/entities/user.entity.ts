import { HasPrimaryEntity, registerEntity } from "@cs/nest-typeorm";
import { Column, Entity } from "typeorm";

@Entity({ name: "user" })
export class UserEntity extends HasPrimaryEntity {
  @Column({
    name: "name",
    comment: "姓名",
    type: "varchar",
    length: 50,
  })
  name: string;

  @Column({
    name: "gender",
    comment: "性别",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  gender: string;

  @Column({
    name: "login_id",
    comment: "账号",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  loginId: string;

  @Column({
    name: "phone_number",
    comment: "电话号码",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    name: "password",
    comment: "密码",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  password: string;

  @Column({
    name: "e_mail",
    comment: "用户电子邮件地址",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  eMail: string;

  @Column({
    name: "remark",
    comment: "备注",
    type: "varchar",
    length: 200,
    nullable: true,
  })
  remark: string;
}

// 注册实体到指定连接
registerEntity({ entity: UserEntity });
