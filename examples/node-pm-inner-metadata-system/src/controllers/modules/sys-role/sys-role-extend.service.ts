import { RpcClient } from "@cs/nest-cloud";
import { ContextService } from "@cs/nest-common";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { dayjs } from "element-plus";
import { map } from "lodash";
import { In } from "typeorm";
import { formatDate } from "../../../web-content/utils/utils";
import { idGen, transField } from "../common/utils";
import { SysRolePermissionEntity } from "./entities/sys-role-permission.entity";
import { SysRoleEntity } from "./entities/sys-role.entity";
import { SysUserRoleEntity } from "./entities/sys-user-role.entity";

/**
 * 角色扩展服务
 * 1.角色-权限项关联
 * 2.产品-模块-权限项
 */
@Injectable()
export class SysRoleExtendService {
  constructor(
    private readonly ctxService: ContextService,
    @InjectRepository({
      entity: SysRoleEntity,
    })
    private readonly _sysRoleRepository: CustomRepository<SysRoleEntity>,
    @InjectRepository({
      entity: SysRolePermissionEntity,
    })
    private readonly _sysRolePermissionRepository: CustomRepository<SysRolePermissionEntity>,
    @InjectRepository({
      entity: SysUserRoleEntity,
    })
    private readonly _sysUserRoleRepository: CustomRepository<SysUserRoleEntity>,
    private readonly rpcClient: RpcClient,
  ) { }

  // 根据产品id查询下属模块和权限项
  async queryProductModulePermission(productId: string) {
    const sql = `
      select
          pr.id as product_id,pr.name as product_name,'module' type,
          mo.id as module_id,-1 as parent_id,mo.name as module_name,mo.code as module_code,
          mo.id, '' permission_name,'' permission_code,'' permission_description
          from sys_product as pr
               left join sys_module as mo on pr.id = mo.product_id
               where pr.id = :productId and pr.is_removed = false
                  and mo.is_removed = false and mo.type = 'module'
      union all
      select
          pr.id as product_id,pr.name as product_name,'permission' type,
          mo.id as module_id,mo.id as parent_id,mo.name as module_name,mo.code as module_code,
          pe.id, pe.name as permission_name,pe.code as permission_code,pe.description as permission_description
          from sys_product as pr
               left join sys_module as mo on pr.id = mo.product_id
               left join sys_permission as pe on mo.id = pe.module_id
               where pr.id = :productId and pr.is_removed = false
                 and pe.is_removed = false and pr.is_removed = false
                 and mo.type = 'module' and mo.is_removed = false
      `;

    const [query, parameters]
      = this._sysRoleRepository.manager.connection.driver.escapeQueryWithParameters(
        sql,
        { productId },
        {},
      );

    const permissions = await this._sysRoleRepository.manager.query(
      query,
      parameters,
    );
    return transField(permissions);
  }

  async removeRolePermission(
    id: string,
    permissions: {
      id: string;
      moduleId: string;
    }[],
  ) {
    const { userId, userName } = this.ctxService.getAllContext();
    return await this._sysRolePermissionRepository
      .createQueryBuilder()
      .update()
      .set({
        isRemoved: true,
        modifierAt: formatDate(),
        modifierId: userId,
        modifierName: userName,
      })
      .where("role_id = :roleId and id in(:...ids)", {
        roleId: id,
        ids: permissions.map(item => item.id),
      })
      .execute();
  }

  /**
   * 角色关联权限项
   * 1.删除当前分配新权限过程取消的权限
   * 2.删除添加的权限
   * 3.批量创建添加的权限
   * @param {RolePermissionType} body
   * @returns {Promise<boolean>} true
   */
  async roleRelationPermission(body: any) {
    const roleData = await this._sysRoleRepository.findOne({
      isRemoved: false,
      id: body.roleId,
    });
    if (!roleData) {
      throw new HttpException("角色不存在", HttpStatus.BAD_REQUEST);
    }

    if (roleData.isDisabled) {
      throw new HttpException(
        "角色已被禁用，禁止分配权限项",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.permissions.length === 0) {
      return true;
    }

    const { userId, userName } = this.ctxService.getAllContext();
    const ids = await idGen.call(this, body.permissions.length + 1);

    const items: any[] = body.permissions.map((item, index) => {
      return {
        id: ids[index],
        roleId: body.roleId,
        permissionId: item.id,
        moduleId: item.moduleId,
        creatorId: userId,
        creatorName: userName,
        modifierId: userId,
        modifierName: userName,
        version: Date.now(),
      };
    });

    // 先删除
    const sql = `update sys_role_permission set is_removed = true,modifier_at = now()
    where concat(cast(ifnull(role_id,0) as char ),"|",cast(ifnull(permission_id,0) as char ),'|',ifnull(module_id,0)) in(:items);`;
    const [query, parameters]
      = this._sysRolePermissionRepository.manager.connection.driver.escapeQueryWithParameters(
        sql,
        {
          items: items.map((item) => {
            return `${item.roleId}|${item.permissionId}|${item.moduleId}`;
          }),
        },
        {},
      );

    if (items.length > 0) {
      await this._sysRolePermissionRepository.manager.transaction(async () => {
        // 直接删除
        await this._sysRolePermissionRepository.manager.query(
          query,
          parameters,
        );

        // 创建
        await this._sysRolePermissionRepository.insert(items);
      });
    }

    return true;
  }

  /**
   * 创建用户角色关联信息表
   * 1.先删除
   * 2.再创建用户角色关联关系表
   * @param body
   * @returns {Promise<string>} true
   */
  async userRelationRole(body: any) {
    const { userId, userName } = this.ctxService.getAllContext();
    const ids = await idGen.call(this, body.roles.length + 1);
    const roles = [];
    const items = map(body.roles, (item, index) => {
      roles.push(item.id);
      return {
        id: ids[index],
        userId: body.userId,
        roleId: item.id,
        creatorId: userId,
        creatorName: userName,
        modifierId: userId,
        modifierName: userName,
        version: Date.now(),
      };
    });

    await this._sysUserRoleRepository.manager.transaction(async () => {
      await this._sysUserRoleRepository
        .createQueryBuilder()
        .update()
        .set({
          isRemoved: true,
          modifierAt: new Date(),
        })
        .where("user_id = :userId and role_id in(:...roles)", {
          userId: body.userId,
          roles,
        })
        .execute();

      await this._sysUserRoleRepository.insert(items);
    });

    return true;
  }

  async removeUserRelationRole(body: any) {
    const { userId, userName } = this.ctxService.getAllContext();
    const removeUserRoleIds = map(body.roles, "id") as string[];
    if (removeUserRoleIds.length === 0) {
      return true;
    }

    return await this._sysUserRoleRepository
      .createQueryBuilder()
      .update()
      .set({
        isRemoved: true,
        modifierId: userId,
        modifierName: userName,
        modifierAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
      .where({
        userId: body.userId,
        id: In(removeUserRoleIds),
      })
      .execute();
  }

  // 查询用户关联的角色
  async findUserRoles(userId: string) {
    const sql = `select ur.id, ur.role_id, r.name as role_name,r.is_disabled,r.description
    from sys_user_role as ur
             left join sys_role as r on ur.role_id = r.id
    where ur.is_removed = false and ur.user_id = :userId
      and r.is_removed = false`;

    const roles = await this._sysUserRoleRepository.executeSql(sql, { userId });

    return {
      userId,
      roles,
    };
  }
}
