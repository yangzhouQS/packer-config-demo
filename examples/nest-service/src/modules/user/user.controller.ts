import { RpcClient } from "@cs/nest-cloud";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserDto } from "./dto/user-all.dto";
import { UserService } from "./user.service";

@ApiTags("用户管理")
@Controller("user")
export class UserController {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly UserService: UserService,
  ) { }

  @ApiOperation({ summary: "添加用户信息" })
  @Post("create-user")
  async createUser(@Body() userDto: Partial<UserDto>) {
    return await this.UserService.createUser(userDto);
  }

  @ApiOperation({ summary: "修改用户信息" })
  @Put("update-user")
  async updateUser(@Body() userDto: Partial<UserDto>) {
    return await this.UserService.updateUser(userDto);
  }

  @ApiOperation({ summary: "验证用户唯一性" })
  @Post("check-user-unique")
  async checkUserUnique(@Body() userDto: Partial<UserDto>) {
    return await this.UserService.checkUserUnique(userDto);
  }

  @ApiOperation({ summary: "验证电话号码重复,重复true否则false" })
  @Post("check-phone-number")
  async checkPhoneNumber(@Body() body): Promise<boolean> {
    const { phoneNumber, id } = body;
    return await this.UserService.checkPhoneNumberExist(phoneNumber, id);
  }

  @ApiOperation({ summary: "验证登录账号重复,重复true否则false" })
  @Post("check-login-id")
  async checkloginId(@Body() body): Promise<boolean> {
    const { loginId, id } = body;
    return await this.UserService.checkLoginIdExist(loginId, id);
  }

  @ApiOperation({ summary: "获取环境信息" })
  @Get("get-plat-form-manu-facturer")
  async getAll(): Promise<any> {
    const result = await this.rpcClient.call({
      rpcConfig: {
        serviceName: "node-bm-shared-backend-service",
      },
      payload: {
        method: "BmCommonService.getPlatformManufacturer",
        params: {},
      },
    });

    if (result.error) {
      throw new HttpException(`${result.error.message}`, HttpStatus.BAD_REQUEST);
    }
    return result.result;
  }
}
