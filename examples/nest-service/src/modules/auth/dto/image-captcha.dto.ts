import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class ImageCaptchaDto {
  @ApiProperty({
    required: false,
    default: 100,
    description: "验证码宽度",
  })
  @IsInt()
  width = 100;

  @ApiProperty({
    required: false,
    default: 50,
    description: "验证码宽度",
  })
  @IsInt()
  height = 50;
}

export class CaptchaDto {
  @ApiProperty({
    description: "base64格式的svg图片",
  })
  img: string;

  @ApiProperty({
    description: "验证码对应的唯一ID",
  })
  id: string;
}
