import { RpcClient } from "@cs/nest-cloud";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { isEmpty, pick } from "lodash";
import { In, Not } from "typeorm";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { SysRolePermissionEntity } from "../sys-role/entities/sys-role-permission.entity";
import { SysPermissionEntity } from "./entities/sys-permission.entity";

@Injectable()
export class SysPermissionService {
  constructor(
    @InjectRepository({
      entity: SysPermissionEntity,
    })
    private readonly _sysPermissionRepository: CustomRepository<SysPermissionEntity>,
    @InjectRepository({
      entity: SysRolePermissionEntity,
    })
    private readonly _sysRolePermissionRepository: CustomRepository<SysRolePermissionEntity>,
    private readonly rpcClient: RpcClient,
  ) {}

  async create(dto: any) {
    return await this._sysPermissionRepository.saveOne(dto);
  }

  async findAll(moduleId: string) {
    const permissions = await this._sysPermissionRepository.find({
      order: {
        id: "desc",
      },
      where: {
        isRemoved: false,
        moduleId,
      },
    });

    return {
      permissions,
    };
  }

  async update(id: string, dto: any) {
    const body = pick(dto, ["code", "name", "description", "moduleId"]);
    return await this._sysPermissionRepository.updateByCondition(body, { id });
  }

  async remove(id: string) {
    await this._sysPermissionRepository.softDeletion({ id });
    await this._sysRolePermissionRepository.softDeletion({ permissionId: id });
    return true;
  }

  async validatePermission(body: any) {
    const { data, field } = body;

    const txt = field === "code" ? "权限项编码" : "权限项名称";

    const result = {
      success: false,
      message: "校验失败",
    };
    if (isEmpty(data[field])) {
      throw new CustomParameterException(`校验字段不能为空`);
    }

    // 更新的校验
    if (data.id > 0) {
      const whereObj = {
        moduleId: data.moduleId,
        [field]: data[field],
        isRemoved: false,
        id: Not(In([data.id])),
      } as any;
      const data1 = await this._sysPermissionRepository.findOne(whereObj);

      if (!data1) {
        result.message = `${field}校验通过，可以使用`;
        result.success = true;
      }
      else {
        result.message = `${txt}「${data[field]}」重复，请修改`;
        result.success = false;
      }

      return result;
    }

    // 创建的校验
    const data2 = await this._sysPermissionRepository.findOne({
      moduleId: data.moduleId,
      [field]: data[field],
      isRemoved: false,
    });

    if (!data2) {
      result.message = `${field}校验通过，可以使用`;
      result.success = true;
    }
    else {
      result.message = `${txt}「${data[field]}」重复，请修改`;
      result.success = false;
    }

    return result;
  }
}
