import { RpcClient } from "@cs/nest-cloud";
import { ContextService } from "@cs/nest-common";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { find, get, pick, trim } from "lodash";
import { In, Not } from "typeorm";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { transField } from "../common/utils";
import { SysModuleEntity } from "../sys-module/entities/sys-module.entity";
import { CreateSysProductDto } from "./dto/create-sys-product.dto";
import { SysProductEntity } from "./entities/sys-product.entity";

@Injectable()
export class SysProductService {
  private fields = [
    "id",
    "name",
    "code",
    "isDisabled",
    "icon",
    "productType",
    "sortCode",
  ] as any[];

  constructor(
    private readonly ctxService: ContextService,
    private readonly rpcClient: RpcClient,
    @InjectRepository({
      entity: SysProductEntity,
    })
    private readonly _sysProductRepository: CustomRepository<SysProductEntity>,
    @InjectRepository({
      entity: SysModuleEntity,
    })
    private readonly _sysModuleRepository: CustomRepository<SysModuleEntity>,
  ) {}

  /**
   * 创建产品
   * 1.校验产品编码是否重复
   * 2.创建
   * @param {CreateSysProductDto} body
   * @returns {Promise<(SysProductEntity & {name?: DeepPartial<SysProductEntity["name"]>, code?: DeepPartial<SysProductEntity["code"]>, productType?: DeepPartial<SysProductEntity["productType"]>, isDisabled?: DeepPartial<SysProductEntity["isDisabled"]>, icon?: DeepPartial<SysProductEntity["icon"]>, sortCode?: DeepPartial<SysProductEntity["sortCode"]>, id?: DeepPartial<SysProductEntity["id"]>, createdAt?: DeepPartial<SysProductEntity["createdAt"]>, creatorId?: DeepPartial<SysProductEntity["creatorId"]>, creatorName?: DeepPartial<SysProductEntity["creatorName"]>, modifierAt?: DeepPartial<SysProductEntity["modifierAt"]>, modifierId?: DeepPartial<SysProductEntity["modifierId"]>, modifierName?: DeepPartial<SysProductEntity["modifierName"]>, isRemoved?: DeepPartial<SysProductEntity["isRemoved"]>, version?: DeepPartial<SysProductEntity["version"]>, updateVersionTimestamp?: DeepPartial<SysProductEntity["updateVersionTimestamp"]>}) | SysProductEntity>}
   */
  async createProduct(body: CreateSysProductDto) {
    body.code = trim(body.code);
    body.name = trim(body.name);

    const products = await this._sysProductRepository
      .createQueryBuilder("product")
      .where("product.is_removed = false")
      .orWhere("product.code = :code", { code: body.code })
      .orWhere("product.name = :name", { name: body.name })
      .getMany();

    if (products.length > 0) {
      const isNameRepeat = find(
        products,
        item => trim(item.name) === body.name,
      );
      if (isNameRepeat) {
        throw new CustomParameterException(
          `产品名称: [${body.name}] 重复禁止创建`,
        );
      }

      const isCodeRepeat = find(
        products,
        item => trim(item.code) === body.code,
      );
      if (isCodeRepeat) {
        throw new CustomParameterException(
          `产品编码: [${body.code}] 重复禁止创建`,
        );
      }
    }

    return await this._sysProductRepository.saveOne(body);
  }

  findAll() {
    return this._sysProductRepository.find({
      select: this.fields,
      order: {
        sortCode: "ASC",
        createdAt: "DESC",
      },
      where: {
        isRemoved: false,
      },
    });
  }

  async queryProductTree(productId: string) {
    const products = await this._sysProductRepository.find({
      select: this.fields,
      where: {
        isRemoved: false,
      },
    });

    const sql = `
              select * from(
                  select 'product' type,id,name,code,product_type,-1 parent_id, sort_code,id product_id,0 'level',is_disabled
                  from sys_product where is_removed = false and id = :productId 
                  union all 
                  select type, id,name,code,'' product_type,case parent_id when -1 then product_id else parent_id end parent_id,sort_code, product_id,level,is_disabled
                  from sys_module where is_removed = false and product_id = :productId
              ) as a
              order by sort_code asc
    `;

    const [query, parameters]
      = this._sysProductRepository.manager.connection.driver.escapeQueryWithParameters(
        sql,
        { productId },
        {},
      );

    let items = await this._sysProductRepository.manager.query(
      query,
      parameters,
    );
    // const items = await this._sysProductRepository.executeSql(sql, {productId})

    items = transField(items);

    for (const item of items) {
      // 模块和分组找到对应的产品信息
      if (item.type !== "product") {
        const curProduct = find(products, row => `${row.id}` === `${item.productId}`);
        item.product = curProduct || {};
      }
    }

    return items;
  }

  async findProductModules(productId: string) {
    const product = await this._sysProductRepository.findOne({
      isRemoved: false,
      id: productId,
    });

    if (!product) {
      throw new CustomParameterException("查询产品不存在");
    }

    const modules = await this._sysModuleRepository.find({
      order: {
        createdAt: "desc",
      },
      where: {
        isRemoved: false,
        productId,
      },
    });

    return { modules: modules || [], product };
  }

  /**
   * 1.点击模块，返回当前模块
   * 2.点击分组，返回分组下所有模块
   * 3.点击产品，返回产品下的所有模块和分组
   * @param body
   * @returns {Promise<string>} xsxs
   */
  async findProductChild(body: any) {
    const module = body.module;
    const product = await this._sysProductRepository.findOne({
      isRemoved: false,
      id: get(body, "product.id"),
    });

    let modules = [];
    /* if (!isEmpty(body.module)) {
    } */

    const whereObj: Record<string, any> = {
      isRemoved: false,
      productId: product.id,
    };

    if (module && module.type === "module") {
      whereObj.id = module.id;
    }

    if (module && module.type === "group") {
      whereObj.parentId = module.id;
    }

    modules = await this._sysModuleRepository.find({
      order: {
        id: "desc",
        // sortCode: "ASC",
        // createdAt: 'desc'
      },
      where: whereObj,
    });

    return { modules, product };
  }

  findOne(id: string) {
    return this._sysProductRepository.findOne({
      isRemoved: false,
      id,
    });
  }

  async updateProduct(productId: string, dto: any) {
    const data = pick(dto, [
      "name",
      "code",
      "isDisabled",
      "icon",
      "version",
      "sortCode",
    ]);
    data.version = Date.now();
    await this._sysProductRepository.updateByCondition(data, { id: productId });
    const product = await this._sysProductRepository.findOne({
      isRemoved: false,
      id: productId,
    });
    return Object.assign(product || {}, { type: "product" });
  }

  /**
   * 产品删除
   * 1.产品下有关联模块时禁止删除
   * 2.给罗列出关联的模块，提示用户是否需要一起删除，或者删除指定的关联模块
   * 3.执行删除策略，删除全部关联模块，删除指定关联模块，不删除关联模块
   * @param {string} productId
   * @returns {Promise<{success: boolean, message: string, modules: SysProductEntity[]}>}
   */
  async removeProduct(productId: string): Promise<{
    success: boolean;
    message: string;
    modules: SysProductEntity[];
  }> {
    const result = {
      success: false,
      message: "",
      modules: [],
    };
    result.modules = await this._sysModuleRepository.find({
      where: {
        isRemoved: false,
        productId,
      },
    });

    if (result.modules && result.modules.length > 0) {
      result.message = "产品下有关联模块时禁止删除";
      return result;
    }

    if (result.modules.length === 0) {
      await this._sysProductRepository.softDeletion({ id: productId });
      result.success = true;
      result.message = "删除成功";
    }
    return result;
  }

  async validateProduct(body: any) {
    const { data, field } = body;
    const txt = field === "code" ? "产品编码" : "产品名称";
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
      const data1 = await this._sysProductRepository.findOne(whereObj);

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
    const data2 = await this._sysProductRepository.findOne({
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
