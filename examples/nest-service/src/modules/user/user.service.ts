import { RpcClient } from "@cs/nest-cloud";
import { Argon2Utils, CommonUtil, ContextService } from "@cs/nest-common";
import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { BadRequestError, InfoRequestError } from "../../exception/bad-request-error";
import { UserEntity } from "../auth/entities/user.entity";
import { SysOperatorEntity } from "../sys-operator/entities/sys-operator.entity";
import { UserDto } from "./dto/user-all.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository({
      entity: UserEntity,
    })
    private readonly UserEntityRoleRepository: CustomRepository<UserEntity>,
    @InjectRepository({
      entity: SysOperatorEntity,
    })
    private readonly _sysOperatorEntityRepository: CustomRepository<SysOperatorEntity>,
    private readonly argon2Utils: Argon2Utils,
    private readonly rpcClient: RpcClient,
    private readonly contextService: ContextService,
  ) { }

  // 统一校验规则
  private readonly PHONE_REGEX = /^1[3-9]\d{9}$/;
  private validatePhone(phone: string) {
    if (!this.PHONE_REGEX.test(phone)) {
      throw new InfoRequestError("手机号格式不正确");
    }
  }

  private validateRequiredFields(userDto: Partial<UserDto>) {
    if (!userDto.phoneNumber && !userDto.loginId) {
      throw new InfoRequestError("电话号码和登录账号必须填写一项");
    }
  }

  async checkUserUnique(userDto: Partial<UserDto>) {
    // 检查电话号码和登录账号是否重复
    const params: any = { isRemoved: false };
    const uniqueConditions = [];
    if (userDto.phoneNumber) {
      uniqueConditions.push(userDto.phoneNumber);
      params.phoneNumber = userDto.phoneNumber;
    }

    if (userDto.loginId) {
      uniqueConditions.push(userDto.loginId);
      params.loginId = userDto.loginId;
    }
    let user = null;
    // 电话号码和登录账号都输入检查重复性
    if (uniqueConditions.length === 2) {
      const users = await this.UserEntityRoleRepository.executeSql(`SELECT * FROM user WHERE is_removed=false and (phone_number='${userDto.phoneNumber}' or login_id='${userDto.loginId}')`);
      if (users.length > 1) {
        throw new InfoRequestError(`电话号码${userDto.phoneNumber},登录账号${userDto.loginId}重复，请重新输入`);
      }
      if (users.length === 1) {
        user = users[0];
      }
    }
    else {
      user = await this.UserEntityRoleRepository.findOne(params);
    }
    if (user) {
      const operator = await this._sysOperatorEntityRepository.findOne({
        userId: user.id,
        isRemoved: false,
      });
      console.log("operator", operator);
      if (user.phoneNumber === userDto.phoneNumber && operator) {
        throw new InfoRequestError(`电话号码【${userDto.phoneNumber}】重复，请重新输入`);
      }
      if (user.loginId === userDto.loginId && operator) {
        throw new InfoRequestError(`登录账号【${userDto.loginId}】重复，请重新输入`);
      }
    }
    return user;
  }

  async createUser(userDto: Partial<UserDto>): Promise<any> {
    // 电话号码和账号必填一个
    this.validateRequiredFields(userDto);
    if (userDto.phoneNumber) {
      this.validatePhone(userDto.phoneNumber);
    }
    // 唯一性校验
    const user = await this.checkUserUnique(userDto);

    const { userId, realName } = this.contextService.getAllContext();
    userDto.id = await this.rpcClient.getNewId();
    if (user) { // 大库存在
      userDto.id = user.id;
      if (userDto.password) {
        userDto.password = await this.argon2Utils.hashPassword(userDto.password);
      }
      const newUserDto = this.UserEntityRoleRepository.suppleEditContext(userDto);
      Object.assign(userDto, newUserDto);
    }
    else {
      userDto.password = await this.argon2Utils.hashPassword(userDto.password);
      const newUserDto = this.UserEntityRoleRepository.suppleAddContext(userDto, userDto.id);
      Object.assign(userDto, newUserDto);
    }
    console.log("userDto", userDto);
    let msg = "";
    let sysOperator = {};
    if ((userDto as any).operatorId) {
      sysOperator = {
        id: await this.rpcClient.getNewId(),
        userId: (userDto as any).operatorId,
        modifierId: userId,
        modifierName: realName,
        version: CommonUtil.getVerSion(),
      };
    }
    else {
      sysOperator = {
        id: await this.rpcClient.getNewId(),
        userId: userDto.id,
        modifierId: userId,
        modifierName: realName,
        version: CommonUtil.getVerSion(),
      };
    }
    const flag = await this.UserEntityRoleRepository.manager.transaction(
      async (entityManage: /* EntityManager */ any) => {
        await entityManage.save(UserEntity, userDto); // 用户户表
        await entityManage.save(SysOperatorEntity, sysOperator);
        return true;
      },
    ).then(() => {
      return true;
    }).catch((error) => {
      msg = error.message;
      return false;
      // throw new BadRequestError(error)
    });
    if (flag) {
      return (userDto as any);
    }
    else {
      throw new BadRequestError(msg);
    }
  }

  async updateUser(userDto: Partial<UserDto>): Promise<UserDto> {
    const user = await this.UserEntityRoleRepository.findOne({ isRemoved: false, id: userDto.userId });
    if (!user) {
      throw new InfoRequestError(`用户不存在`);
    }

    // 电话号码和账号必填一个
    this.validateRequiredFields(userDto);
    if (userDto.phoneNumber) {
      this.validatePhone(userDto.phoneNumber);
    }
    if (userDto.loginId && user.loginId !== userDto.loginId) {
      const users = await this.UserEntityRoleRepository.findMany({ isRemoved: false, loginId: userDto.loginId });
      if (users.length > 0) {
        throw new InfoRequestError(`账号${userDto.loginId}重复，请重新输入账号`);
      }
    }
    if (userDto.phoneNumber && user.phoneNumber !== userDto.phoneNumber) {
      const phones = await this.UserEntityRoleRepository.findMany({ isRemoved: false, phoneNumber: userDto.phoneNumber });
      if (phones.length > 0) {
        throw new InfoRequestError(`电话号码${userDto.phoneNumber}重复，请重新输入电话号码`);
      }
    }
    userDto.id = userDto.userId;
    if (userDto.password) {
      userDto.password = await this.argon2Utils.hashPassword(userDto.password);
    }
    else {
      delete userDto.password;
    }
    const newUserDto = this.UserEntityRoleRepository.suppleEditContext(userDto);
    Object.assign(userDto, newUserDto);
    let msg = "";
    const flag = await this.UserEntityRoleRepository.manager.transaction(
      async (entityManage: /* EntityManager */ any) => {
        await entityManage.save(UserEntity, userDto); // 用户户表

        return true;
      },
    ).then(() => {
      return true;
    }).catch((error) => {
      msg = error.message;
      return false;
    });
    if (flag) {
      return userDto;
    }
    else {
      throw new BadRequestError(msg);
    }
  }

  async checkPhoneNumberExist(phoneNumber: string, _id?: string): Promise<any> {
    const user = await this.UserEntityRoleRepository.findOne({
      phoneNumber,
      isRemoved: false,
    });

    if (!user) {
      return { isExist: false }; // 用户不存在直接返回
    }
    else {
      const operator = await this._sysOperatorEntityRepository.findOne({
        userId: user.id,
        isRemoved: false,
      });
      if (operator) {
        return { isExist: true, msg: `电话号码在已存在，请重新输入` };
      }
      else {
        return { isExist: false, user };
      }
    }
  }

  async checkLoginIdExist(loginId: string, _id?: string): Promise<any> {
    const user = await this.UserEntityRoleRepository.findOne({
      loginId,
      isRemoved: false,
    });

    if (!user) {
      return { isExist: false }; // 用户不存在直接返回
    }
    else {
      const operator = await this._sysOperatorEntityRepository.findOne({
        userId: user.id,
        isRemoved: false,
      });
      if (operator) {
        return { isExist: true, msg: `登录账号已存在` };
      }
      else {
        return { isExist: false, user };
      }
    }
  }
}
