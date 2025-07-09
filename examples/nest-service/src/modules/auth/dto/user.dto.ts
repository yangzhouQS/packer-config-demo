import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  loginId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  eMail: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  password: string;
}

export class LoginDto {
  @IsString()
  userName?: string;

  @IsString()
  varifyCode?: string;

  @IsString()
  password?: string;

  @IsString()
  captchaId?: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  flag?: LoginType;
}

export class UserIdDto {
  @IsNotEmpty()
  userId: string;
}

// 定义枚举类型
export enum LoginType {
  SMS = "SMS",
  PASSWORD = "PASSWORD",
}
