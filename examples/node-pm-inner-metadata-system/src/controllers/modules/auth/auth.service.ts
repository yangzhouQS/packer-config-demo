import { RpcErrorCode, RpcException, RpcMethod, RpcParam, RpcService } from "@cs/nest-cloud";
import { Argon2Utils, CommonUtil, LoggerService } from "@cs/nest-common";
import { ConfigService } from "@cs/nest-config";
import { RedisService } from "@cs/nest-redis";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
// import * as bcrypt from 'bcrypt';
import { isEmpty } from "lodash";
import * as svgCaptcha from "svg-captcha";
import { CaptchaDto, ImageCaptchaDto, LoginDto, UserDto } from "./dto";
import { UserService } from "./user.service";

@Injectable()
@RpcService({
  name: "auth",
  description: "认证服务",
})
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly argon2Service: Argon2Utils,
  ) { }

  private readonly UID_EXPIRATION = 2 * 60 * 60; // 2 hours

  @RpcMethod({
    name: "login",
    description: "登录",
  })
  async login(
    @RpcParam({
      name: "loginDto",
      description: "登录参数",
    })
    loginDto: LoginDto,
  ): Promise<any> {
    let user: UserDto;
    switch (loginDto.flag) {
      case "PASSWORD":
        user = await this.validatePassword(
          loginDto.userName,
          loginDto.password,
        );
        break;
      // case 'SMS':
      //   user = await this.validateSmsCode(
      //     loginDto.phoneNumber,
      //     loginDto.varifyCode,
      //   );
      //   break;
      default:
        throw new HttpException("Invalid login type", HttpStatus.UNAUTHORIZED);
    }
    if (!user) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }
    const uid = await this.createUid(user);
    return { uid, user };
  }

  private async validatePassword(
    username: string,
    password: string,
  ): Promise<UserDto> {
    const user = await this.userService.findOne({ loginId: username });
    if (!user) {
      throw new HttpException("登陆校验失败 -1", HttpStatus.UNAUTHORIZED);
    }
    const isPasswordValid = await this.argon2Service.verifyPassword(
      user.password,
      password,
    );
    if (user && isPasswordValid) {
      return user;
    }
    return null;
  }

  async hashedPassword(
    password: string,
  ): Promise<string> {
    const hashedPassword = await this.argon2Service.hashPassword(password);
    return hashedPassword;
  }

  // private async validateSmsCode(phone: string, code: string): Promise<User> {
  // const isValid = await this.smsService.verifyCode(phone, code);
  // if (!isValid) {
  //   return null;
  // }

  // // 根据手机号查找用户
  // const user = await this.userRepository.findOne({ where: { phone } });
  // if (!user) {
  //   throw new UnauthorizedException('User not found');
  // }
  // return user;
  // }

  @RpcMethod({
    name: "logout",
    description: "登出",
  })
  async logout(
    uid: string,
  ): Promise<void> {
    await this.redisService.getRedis().del(`cas:session:inner:${uid}`);
  }

  /**
   * 生成验证码
   *
   * @param {ImageCaptchaDto} captcha
   * @return {*}  {Promise<CaptchaDto>}
   * @memberof AuthService
   */
  async getVerifyCode(captcha: ImageCaptchaDto): Promise<CaptchaDto> {
    const svg = svgCaptcha.createMathExpr({
      size: 4,
      ignoreChars: "0o1i",
      background: "antiquewhite",
      color: true,
      noise: 2,
      fontSize: 58,
      width: isEmpty(captcha.width) ? 100 : captcha.width,
      height: isEmpty(captcha.height) ? 50 : captcha.height,
      charPreset: "1234567890qwertyuiopasdfghjklzxcvbnm",
    });
    const result = {
      // eslint-disable-next-line node/prefer-global/buffer
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        "base64",
      )}`,
      id: CommonUtil.idGenerate(),
    };
    await this.redisService
      .getRedis()
      .set(`auth:captcha:img:${result.id}`, svg.text, "EX", 60 * 5);
    return result;
  }

  async createUid(user: UserDto): Promise<string> {
    const id = `${CommonUtil.idGenerate()}`;
    const now = new Date();
    const sessionTTL = this.config.get("auth").sessionTTL;
    const expiresAt = new Date(now.getTime() + (sessionTTL || this.UID_EXPIRATION) * 1000);
    const uid = { id: user.id, realName: user.name, userName: user.loginId, createdAt: now, expiresAt };
    if (!user.id) {
      throw new RpcException("Invalid userId", RpcErrorCode.UNAUTHORIZED);
    }
    await this.redisService
      .getRedis()
      .setex(`cas:session:inner:${id}`, sessionTTL || this.UID_EXPIRATION, JSON.stringify(uid));
    return id;
  }

  // 续存uid存活时间
  // async updateUid(uid: string): Promise<TGT> {
  //   const tgt = await this.validateTGT(tgtId);
  //   tgt.tenantId = tenantId;
  //   await this.redisService
  //     .getRedis()
  //     .setex(`cas:ticket:tgt:${tgtId}`, this.TGT_EXPIRATION, JSON.stringify(tgt));
  //   return tgt;
  // }
}
