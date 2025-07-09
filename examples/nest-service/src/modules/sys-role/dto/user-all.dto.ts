import { HasPrimaryDto } from "@cs/nest-common";
import { IsEmail, IsString } from "class-validator";

export class UserDto extends HasPrimaryDto {
  @IsString()
  tenantId?: string;

  @IsString()
  userId?: string;

  @IsString()
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  gender?: string;

  @IsString()
  loginId?: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  password?: string;

  @IsEmail()
  eMail?: string;

  @IsString()
  remark?: string;
}
