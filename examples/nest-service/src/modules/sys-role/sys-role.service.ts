import { RpcClient } from "@cs/nest-cloud";
import { Argon2Utils, ContextService } from "@cs/nest-common";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { trim } from "lodash";
import { In, Not } from "typeorm";
import { InfoRequestError } from "../../exception/bad-request-error";
import { UserEntity } from "../auth/entities/user.entity";
import { transField } from "../common/utils";
import { SysOperatorEntity } from "../sys-operator/entities/sys-operator.entity";
import { SysPermissionEntity } from "../sys-permission/entities/sys-permission.entity";
import { CreateSysRoleDto } from "./dto/create-sys-role.dto";
import { UserDto } from "./dto/user-all.dto";
import { SysRolePermissionEntity } from "./entities/sys-role-permission.entity";
import { SysRoleEntity } from "./entities/sys-role.entity";
import { SysUserRoleEntity } from "./entities/sys-user-role.entity";

@Injectable()
export class SysRoleService {
  constructor(
    @InjectRepository({
      entity: SysRoleEntity,
    })
    private readonly _sysRoleRepository: CustomRepository<SysRoleEntity>,
    @InjectRepository({
      entity: SysUserRoleEntity,
    })
    private readonly _sysUserRoleRepository: CustomRepository<SysUserRoleEntity>,
    @InjectRepository({
      entity: UserEntity,
    })
    private readonly UserEntityRoleRepository: CustomRepository<UserEntity>,
    @InjectRepository({
      entity: SysPermissionEntity,
    })
    private readonly _sysPermissionRepository: CustomRepository<SysPermissionEntity>,
    @InjectRepository({
      entity: SysRolePermissionEntity,
    })
    private readonly _sysRolePermissionRepository: CustomRepository<SysRolePermissionEntity>,
    @InjectRepository({
      entity: SysOperatorEntity,
    })
    private readonly _sysOperatorEntityRepository: CustomRepository<SysOperatorEntity>,
    private readonly argon2Utils: Argon2Utils,
    private readonly rpcClient: RpcClient,
    private readonly contextService: ContextService,
  ) { }

  // 统一校验规则
  private readonly PHONE_REGEX = /^1[3-9]\d{9}$/;
  private validatePhone(phone: string) {
    if (!this.PHONE_REGEX.test(phone)) {
      throw new InfoRequestError("手机号格式不正确");
    }
  }

  private validateRequiredFields(userDto: Partial<UserDto>) {
    if (!userDto.phoneNumber && !userDto.loginId) {
      throw new InfoRequestError("电话号码和登录账号必须填写一项");
    }
  }

  /**
   * 1.角色名称不能为空
   * 2.角色名称不能重复
   * @param {CreateSysRoleDto} dto
   * @returns {Promise<(SysRoleEntity & {name?: DeepPartial<SysRoleEntity["name"]>, isDisabled?: DeepPartial<SysRoleEntity["isDisabled"]>, description?: DeepPartial<SysRoleEntity["description"]>, id?: DeepPartial<SysRoleEntity["id"]>, createdAt?: DeepPartial<SysRoleEntity["createdAt"]>, creatorId?: DeepPartial<SysRoleEntity["creatorId"]>, creatorName?: DeepPartial<SysRoleEntity["creatorName"]>, modifierAt?: DeepPartial<SysRoleEntity["modifierAt"]>, modifierId?: DeepPartial<SysRoleEntity["modifierId"]>, modifierName?: DeepPartial<SysRoleEntity["modifierName"]>, isRemoved?: DeepPartial<SysRoleEntity["isRemoved"]>, version?: DeepPartial<SysRoleEntity["version"]>, updateVersionTimestamp?: DeepPartial<SysRoleEntity["updateVersionTimestamp"]>}) | SysRoleEntity>}
   */
  async createRole(dto: CreateSysRoleDto) {
    const roleName = trim(dto.name);
    const roleData = await this._sysRoleRepository.findOne({
      isRemoved: false,
      name: roleName,
    });
    if (roleData) {
      throw new HttpException(
        `角色名称: [ ${roleName} ] 重复, 修改后创建`,
        HttpStatus.BAD_REQUEST,
      );
    }

    dto.name = trim(dto.name);
    return this._sysRoleRepository.saveOne(dto);
  }

  async queryRoles() {
    return this._sysRoleRepository.find({
      order: {
        createdAt: "DESC",
      },
      where: { isRemoved: false },
    });
  }

  /**
   * 查询角色下所有权限项
   * 1.查询角色
   * 2.查询权限项
   * 3.查询权限项所属的模块信息
   * @param {string} roleId
   * @returns {Promise<{role: {}, permissions: any[], message: string} | SysRoleEntity[]>} 返回角色权限项
   */
  async queryRolePermissions(roleId: string) {
    const result = {
      message: "",
      role: {},
      permissions: [],
    };

    const role = await this._sysRoleRepository.findOne({
      isRemoved: false,
      id: roleId,
    });
    if (!role) {
      result.message = `查询角色不存在`;
      return result;
    }
    result.role = role;

    const sql = `select rp.id,rp.permission_id,rp.role_id,rp.module_id,
       m.name as module_name,m.code as module_code, p.id as product_id,p.name as product_name,p.code as product_code,
       sp.code as permission_code, sp.name as permission_name
        from sys_role_permission as rp
        left join sys_module as m -- 模块信息
                 on rp.module_id = m.id
        left join sys_product as p on m.product_id = p.id
        left join sys_permission as sp
                on rp.permission_id = sp.id
        where rp.role_id = :roleId and rp.is_removed = false
        and m.is_removed = false
        and sp.is_removed = false`;

    const [query, parameters]
      = this._sysRoleRepository.manager.connection.driver.escapeQueryWithParameters(
        sql,
        { roleId },
        {},
      );

    const permissions = await this._sysRoleRepository.manager.query(
      query,
      parameters,
    );

    result.permissions = transField(permissions);

    return result;
  }

  // 更新角色
  async updateRole(roleId: string, body: any) {
    await this._sysRoleRepository.updateByCondition(
      {
        isDisabled: body.isDisabled,
        name: body.name,
        description: body.description,
      },
      {
        id: roleId,
      },
    );

    return await this._sysRoleRepository.findOne({ id: roleId });
  }

  /**
   * 删除角色
   * 1.角色已经授权时禁止删除
   * @param {string} roleId
   * @returns {Promise<{success: boolean, message: string}>} 删除结果
   */
  async removeRole(roleId: string) {
    const result = {
      success: false,
      message: "",
      role: null,
      roleUsers: [],
    };

    const role = await this._sysRoleRepository.findOne({
      id: roleId,
    });
    result.role = role;

    if (!role) {
      throw new HttpException(`删除角色不存在`, HttpStatus.BAD_REQUEST);
    }

    const sql = `select distinct u.id,u.name
    from sys_user_role as ur
         left join user as u on ur.user_id = u.id
         where ur.role_id = :roleId and ur.is_removed = false`;

    const roleUsers = await this._sysRoleRepository.executeSql(sql, { roleId });

    // 已经被用户使用
    if (roleUsers.length > 0) {
      result.success = false;
      result.message = "当前角色已经分配给用户无法删除";
      result.roleUsers = roleUsers;
      return result;
    }

    // 直接删除
    await this._sysRoleRepository.softDeletion({ id: roleId });
    result.success = true;
    result.message = "角色删除成功";

    return result;
  }

  async validateRole(body: any) {
    const { data, field } = body;
    const txt = "角色名称";
    const result = {
      success: false,
      message: "校验失败",
    };

    // 更新的校验
    if (data.id > 0) {
      const whereObj = {
        [field]: data[field],
        isRemoved: false,
        id: Not(In([data.id])),
      } as any;
      const data1 = await this._sysRoleRepository.findOne(whereObj);

      if (!data1) {
        result.message = `${txt}${field}校验通过，可以使用`;
        result.success = true;
      }
      else {
        result.message = `${txt}「${data[field]}」重复，请修改`;
        result.success = false;
      }
      return result;
    }

    // 创建的校验
    const data2 = await this._sysRoleRepository.findOne({
      [field]: data[field],
      isRemoved: false,
    });

    if (!data2) {
      result.message = `${txt}${field}校验通过，可以使用`;
      result.success = true;
    }
    else {
      result.message = `${txt}「${data[field]}」重复，请修改`;
      result.success = false;
    }

    return result;
  }
}
