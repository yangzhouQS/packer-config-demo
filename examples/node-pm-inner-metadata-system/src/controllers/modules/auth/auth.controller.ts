import { RpcClient } from "@cs/nest-cloud";
import { ConfigService } from "@cs/nest-config";
import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { ImageCaptchaDto, LoginDto } from "./dto";

@Controller()
@ApiTags("登录以及注销")
export class AuthController {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) { }

  @ApiOperation({ summary: "登录认证" })
  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 验证用户凭据
    const { user, uid } = await this.authService.login(loginDto);
    const uidConfig = this.config.get("auth");

    try {
      // 设置 HttpOnly Cookie
      response.cookie("__inneruid", uid, {
        signed: true,
        httpOnly: true,
        secure: uidConfig.secure,
        sameSite: "lax", // 允许跨站点导航时发送 lax 或 none
        path: "/",
      });

      const result = await this.rpcClient.call({
        rpcConfig: {
          serviceName: "node-pm-share-inner-metadata-service",
        },
        payload: {
          method: "innerMetadataApiService.getUserRedirect",
          params: {
            userId: user.id,
          },
        },
      });
      return {
        redirectUrl: result.result && ((result.result) as any).url ? ((result.result) as any).url : `${uidConfig.defaultRedirectService}`,
      };
    }
    catch (error) {
      console.log(error);
      return {
        redirectUrl: `${uidConfig.defaultRedirectService}`,
      };
      // console.log(error);
      // throw error;
    }
  }

  @ApiOperation({ summary: "注销" })
  @Get("logout")
  async logout(@Req() req, @Res() res) {
    // 1. 从Cookie中获取inneruid（如果可用）
    const inneruid = req.signedCookies?.__inneruid;
    const uidConfig = this.config.get("auth");
    await this.authService.logout(inneruid);
    // 3. 清除客户端Cookie
    res.clearCookie("__inneruid", {
      signed: true,
      httpOnly: true,
      secure: uidConfig.secure,
      sameSite: "lax", // 允许跨站点导航时发送 lax 或 none
      path: "/",
    });
    // 重定向到注销页面
    const loginUrl = new URL("/inner/login.html", uidConfig.authLogoutUrl);
    return res.json({
      status: "success",
      redirectUrl: loginUrl.toString(),
    });
  }

  @ApiOperation({ summary: "获取图片验证码" })
  @Get("verifyCode")
  async getVerifyCode(@Query() dto: ImageCaptchaDto) {
    return await this.authService.getVerifyCode(dto);
  }
}
