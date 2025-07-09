import { AuthClientMiddleware } from "@cs/nest-auth-client";
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { innerMetadataModules } from "./modules/inner-metadata.modules";
import { ShareModule } from "./share.module";

@Module({
  imports: [ShareModule, AuthModule, ...innerMetadataModules],
  providers: [AppService],
  controllers: [AppController],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthClientMiddleware)
      .exclude(
        // 根据需要添加更多要排除的路由
        { path: "login.html", method: RequestMethod.ALL },
        { path: "verifyCode", method: RequestMethod.GET },
        { path: "login", method: RequestMethod.POST },
      )
      .forRoutes("/*");
  }
}
