import { PartialType } from "@nestjs/mapped-types";
import { CreateSysPermissionDto } from "./create-sys-permission.dto";

export class UpdateSysPermissionDto extends PartialType(CreateSysPermissionDto) {}
