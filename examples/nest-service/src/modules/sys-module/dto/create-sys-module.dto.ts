import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSysModuleDto {
  id?: string;

  @IsString()
  @IsNotEmpty({ message: "模块编码不能为空" })
  code: string;

  @IsString()
  @IsNotEmpty({ message: "模块名称不能为空" })
  name: string;

  /* @IsString()
  @IsNotEmpty({message: '模块平台类型不能为空'})
  appType: string; */

  @IsString()
  @IsNotEmpty({ message: "模块使用类型不能为空" })
  moduleType: string;

  @IsString()
  @IsNotEmpty({ message: "模块地址不能为空" })
  url: string;

  @IsString()
  productId: string;

  @IsString()
  parentId: string;

  @IsString()
  icon: string;

  @IsNumber()
  sortNum: number;

  isDisabled?: boolean | number;

  @IsBoolean()
  isVisible: number;

  @IsBoolean()
  isDefault: number;

  @IsBoolean()
  isLeaf: number;

  // @IsString()
  // group: string;
}
