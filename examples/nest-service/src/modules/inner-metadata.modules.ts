import { SysModuleModule } from "./sys-module/sys-module.module";
import { SysOperatorModule } from "./sys-operator/sys-operator.module";
import { SysPermissionModule } from "./sys-permission/sys-permission.module";
import { SysProductModule } from "./sys-product/sys-product.module";
import { SysRoleModule } from "./sys-role/sys-role.module";
// import { UserTestModule } from "./user-test/user-test.module";
import { UserModule } from "./user/user.module";

export const innerMetadataModules = [
  SysProductModule,
  SysModuleModule,
  SysPermissionModule,
  SysRoleModule,
  SysOperatorModule,
  UserModule,
  // 临时测试
  // UserTestModule,
];
