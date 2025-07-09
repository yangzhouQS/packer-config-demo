import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSysProductDto {
  id?: string;

  @ApiPropertyOptional({
    minimum: 3,
    maximum: 50,
    default: "",
    type: "string",
    description: "产品名称",
  })
  @IsNotEmpty({ message: "产品名称不能为空" })
  @IsString({ message: "产品名称" })
  name: string;

  @ApiPropertyOptional({
    minimum: 3,
    maximum: 50,
    default: "",
    type: "string",
    description: "产品编码",
  })
  @IsNotEmpty({ message: "产品编码不能为空" })
  @IsString({ message: "产品编码" })
  code: string;

  @ApiPropertyOptional({
    default: "",
    type: "string",
    description: "产品图标",
  })
  @IsString({ message: "产品图标" })
  icon: string;

  @ApiPropertyOptional({
    default: "web",
    type: "string",
    description: "产品类型",
  })
  @IsString({ message: "产品类型" })
  productType: string;

  @ApiPropertyOptional({
    default: 1,
    type: "number",
    description: "排序",
  })
  @IsNumber()
  sortCode: number;
}
