import { PartialType } from "@nestjs/mapped-types";
import { CreateSysRoleDto } from "./create-sys-role.dto";

export class UpdateSysRoleDto extends PartialType(CreateSysRoleDto) {}
