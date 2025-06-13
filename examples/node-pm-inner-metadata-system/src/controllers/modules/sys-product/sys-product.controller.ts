import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { isEmpty } from "lodash";
import { CustomParameterException } from "../common/exception/custom-parameter-exception";
import { CreateSysProductDto } from "./dto/create-sys-product.dto";
import { SysProductService } from "./sys-product.service";

@ApiTags("sys-product:产品管理")
@Controller("sys-product")
export class SysProductController {
  constructor(private readonly sysProductService: SysProductService) {}

  @ApiOperation({ summary: "创建产品" })
  @Post()
  createProduct(@Body() body: CreateSysProductDto) {
    if (isEmpty(body)) {
      throw new CustomParameterException("创建参数不完整");
    }
    return this.sysProductService.createProduct(body);
  }

  @ApiOperation({ summary: "查询所有产品" })
  @Get("products")
  findAll() {
    return this.sysProductService.findAll();
  }

  @ApiOperation({ summary: "查询产品和模块组成的菜单" })
  @Get(":productId/product-tree")
  queryProductTree(@Param("productId") productId: string) {
    return this.sysProductService.queryProductTree(productId);
  }

  @ApiOperation({ summary: "查询产品下所有模块" })
  @Get(":productId/modules")
  findProductModules(@Param("productId") id: string) {
    return this.sysProductService.findProductModules(id);
  }

  @ApiOperation({ summary: "查询产品下模块或分组，参数作为过滤条件" })
  @ApiBody({
    schema: {
      example: {
        type: "product",
        id: "805883463107584",
        name: "内部系统元数据",
        code: "pm-inner-metadata",
        productType: "web",
        parentId: "-1",
        sortCode: 11,
        productId: "-1",
      },
    },
  })
  @Post("product-child")
  findProductChild(@Body() body: any) {
    if (isEmpty(body)) {
      throw new CustomParameterException("查询参数不完整");
    }

    if (isEmpty(body.product)) {
      throw new CustomParameterException("查询参数 body.product 不完整");
    }

    return this.sysProductService.findProductChild(body);
  }

  @ApiOperation({ summary: "查询产品" })
  @Get("query")
  findOne(@Query("id") id: string) {
    if (isEmpty(id)) {
      throw new CustomParameterException("产品ID不能为空");
    }
    return this.sysProductService.findOne(id);
  }

  @ApiOperation({ summary: "更新产品" })
  @Put(":productId/update")
  updateProduct(@Param("productId") productId: string, @Body() body: any) {
    if (!productId) {
      throw new CustomParameterException("产品ID不能为空");
    }
    return this.sysProductService.updateProduct(productId, body);
  }

  @ApiOperation({ summary: "删除产品" })
  @Delete(":productId/remove")
  removeProduct(@Param("productId") productId: string) {
    if (!productId) {
      throw new CustomParameterException("产品ID不能为空");
    }
    return this.sysProductService.removeProduct(productId);
  }

  @ApiOperation({ summary: "校验产品名称和产品编码是否重复" })
  @Post("validate-product")
  validateProduct(@Body() body: Record<string, any>) {
    if (isEmpty(body) || isEmpty(body.data)) {
      throw new CustomParameterException("校验参数不完整");
    }

    if (isEmpty(body.field)) {
      throw new CustomParameterException("body.field 参数不完整");
    }

    if (isEmpty(body.data[body.field])) {
      throw new CustomParameterException(`校验字段不能为空`);
    }

    return this.sysProductService.validateProduct(body);
  }
}
