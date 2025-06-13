import { RpcClient } from "@cs/nest-cloud";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { pick } from "lodash";
import { UserEntity } from "../auth/entities/user.entity";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { idGen } from "../common/utils";
import { SysUserRoleEntity } from "../sys-role/entities/sys-user-role.entity";
import { SysOperatorEntity } from "./entities/sys-operator.entity";

@Injectable()
export class SysOperatorService {
  constructor(
    private readonly rpcClient: RpcClient,

    @InjectRepository({
      entity: SysOperatorEntity,
    })
    private readonly _sysOperatorRepository: CustomRepository<SysOperatorEntity>,

    @InjectRepository({
      entity: UserEntity,
    })
    private readonly _userRepository: CustomRepository<UserEntity>,

    @InjectRepository({
      entity: SysUserRoleEntity,
    })
    private readonly _uysUserRoleRepository: CustomRepository<SysUserRoleEntity>,
  ) {}

  async queryPhoneUser(phoneNumber: string) {
    const result = {
      user: {},
      success: false,
      message: "",
    };
    const user = await this._userRepository.findOne({
      isRemoved: false,
      phoneNumber,
    });

    if (!user) {
      throw new CustomParameterException(
        `手机号：${phoneNumber} 在系统内不存在，请先添加`,
      );
    }

    const operator = await this._sysOperatorRepository.findOne({
      isRemoved: false,
      userId: user.id,
    });

    result.user = pick(user, [
      "id",
      "gender",
      "loginId",
      "name",
      "phoneNumber",
      "remark",
    ]);

    // 添加至内部系统用户表，至存储用户id
    if (!operator) {
      const id = await idGen.call(this);
      Object.assign(result.user, { sysOperatorId: id });
      await this._sysOperatorRepository.saveOne({ userId: user.id, id });
    }
    else {
      result.success = false;
      result.message = "用户已经存在，请勿重复添加";
      return result;
    }

    result.success = true;
    result.message = `用户: ${user.name} 添加成功`;
    return result;
  }

  async queryOperatorList(body: any) {
    const sql = `
    select op.id as sys_operator_id,u.id,u.name,u.gender,u.login_id,u.phone_number from sys_operator as op
      join user as u on op.user_id = u.id
      where op.is_removed = false and u.is_removed = false
      and op.id > 0 
      ${body.phoneNumber ? "and (u.phone_number like :phoneNumber or u.name like :phoneNumber)" : ""}
      order by op.created_at desc 
      limit :limit offset :offset
    `;

    return await this._sysOperatorRepository.executeSql(sql, body);
  }

  /**
   * 删除内部用户
   * 删除用户授权
   * @param body
   * @returns {Promise<void>}
   */
  async removeOperatorUser(body: any) {
    await this._sysOperatorRepository.manager.transaction(async () => {
      // 删除内部用户
      await this._sysOperatorRepository.softDeletion({
        id: body.sysOperatorId,
      });

      // 删除用户角色授权关联
      await this._uysUserRoleRepository.softDeletion({ userId: body.id });
    });
    return true;
  }
}
