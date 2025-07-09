import { RpcClient } from "@cs/nest-cloud";
import { ContextService } from "@cs/nest-common";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { unset } from "lodash";
import { idGen } from "../common/utils";
import { SysPermissionEntity } from "../sys-permission/entities/sys-permission.entity";
import { SysProductEntity } from "../sys-product/entities/sys-product.entity";
import { SysModuleEntity } from "./entities/sys-module.entity";

@Injectable()
export class SysModuleService {
  constructor(
    private readonly ctxService: ContextService,
    private readonly rpcClient: RpcClient,

    @InjectRepository({
      entity: SysModuleEntity,
    })
    private readonly _sysModuleRepository: CustomRepository<SysModuleEntity>,

    @InjectRepository({
      entity: SysProductEntity,
    })
    private readonly _sysProductRepository: CustomRepository<SysProductEntity>,

    @InjectRepository({
      entity: SysPermissionEntity,
    })
    private readonly _sysPermissionRepository: CustomRepository<SysPermissionEntity>,
  ) {}

  /**
   * 1.创建模块
   * 2.创建分组
   * 3.处理fullId和fullName/level字段的存储值
   * 4.三级菜单只支持模块不支持分组
   * @param dto
   * @returns {Promise<any>} Promise<any>
   */
  async createModule(dto: any) {
    const { userId, userName } = this.ctxService.getAllContext();

    const id = await idGen.call(this);
    const fullData = {
      id,
      fullId: "",
      fullName: "",
      level: 0,
      isLeaf: false,
    };
    let parent = null;

    // 处理fullId 全称字段
    // 上级为产品
    if (dto.parentId === dto.productId) {
      parent = await this._sysProductRepository.findOne({
        isRemoved: false,
        id: dto.productId,
      });
      if (parent) {
        Object.assign(parent, {
          fullId: parent.id,
          fullName: parent.name,
          level: 0,
        });
      }
    }
    else {
      parent = await this._sysModuleRepository.findOne({
        isRemoved: false,
        id: dto.parentId,
      });

      // 模块下禁止创建子级
      if (parent.type === "module") {
        throw new HttpException(
          `所选上级${parent.name}是模块，不支持创建子级`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (!parent) {
      throw new HttpException(`父级模块: 不存在`, HttpStatus.BAD_REQUEST);
    }

    fullData.level = parent.level + 1;
    fullData.fullId = `${parent.fullId}|${id}`;
    fullData.fullName = `${parent.fullName}|${dto.name}`;

    // 判断是否是三级菜单，不支持分组
    if (fullData.level === 3) {
      fullData.isLeaf = true;
      if (dto.type === "group") {
        throw new HttpException(
          `三级模块: [${dto.name}] 类型只支持模块，请修改`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    else {
      fullData.isLeaf = false;
    }

    Object.assign(dto, fullData, {
      creatorId: userId,
      creatorName: userName,
    });

    return await this._sysModuleRepository.saveOne(dto);
  }

  findAll() {
    return this._sysModuleRepository.find({
      where: {
        isRemoved: false,
      },
    });
  }

  _findOne(id: string) {
    return this._sysModuleRepository.findOne({
      isRemoved: false,
      id,
    });
  }

  async update(id: string, dto: any) {
    unset(dto, "id");
    await this._sysModuleRepository.updateByCondition(dto, { id });
    return true;
  }

  /**
   * 模块删除
   * 1.角色关联模块权限项
   * 2.删除模块权限项
   * 3.删除模块
   * @param {string} id
   * @returns {Promise<boolean>} Promise<boolean>
   */
  async remove(id: string) {
    const { userId, userName } = this.ctxService.getAllContext();
    const sql = `update sys_role_permission as t1
                  join (select p.id
                        from sys_module as m
                                 left join sys_permission as p on m.id = p.module_id
                        where m.id = :moduleId and p.id is not null
                        ) as t2 on t1.permission_id = t2.id
                  set t1.is_removed = true,
                  t1.module_id = :userId ,
                  t1.modifier_name = :userName,
                  t1.version = :version
                  where t1.permission_id = t2.id`;
    await this._sysModuleRepository.executeSql(sql, {
      moduleId: id,
      userId,
      userName,
      version: Date.now(),
    });

    await this._sysModuleRepository.softDeletion({ id });
    await this._sysPermissionRepository.softDeletion({ moduleId: id });
    return true;
  }
}
