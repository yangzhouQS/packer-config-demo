import { join } from "node:path";
import { AuthClientModule } from "@cs/nest-auth-client";
import { CSModule } from "@cs/nest-cloud";
import { ConfigModule, ConfigService } from "@cs/nest-config";
import { RedisModule } from "@cs/nest-redis";
import { DatabaseModule } from "@cs/nest-typeorm";
import { Global } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

@Global()
@CSModule({
  imports: [
    AuthClientModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          ...config.get("auth"),
        };
      },
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return [
          {
            rootPath: join(__dirname, "../..", "dist/"),
            serveRoot: `/${config.get("serverPath")}`,
            exclude: [], // 定义要排除的路径模式，这些路径不会被作为静态文件处理
            serveStaticOptions: {
              fallthrough: false, // 表示如果找不到请求的静态文件，继续传递请求给下一个中间件或路由处理器
            },
          },
        ];
      },
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          ...config.get("redis"),
        };
      },
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return config.get("mysql");
      },
    }),
  ],
  providers: [],
  exports: [RedisModule],
})
export class ShareModule {
}
