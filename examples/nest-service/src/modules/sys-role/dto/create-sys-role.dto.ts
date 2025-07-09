import { IsNotEmpty, IsString } from "class-validator";

export class CreateSysRoleDto {
  id?: string;

  @IsString()
  @IsNotEmpty({ message(validationArguments) {
    return `${validationArguments.property}不能为空`;
  } })
  name: string;

  isDisabled: boolean;

  @IsString()
  description?: string;
}
