import { PartialType } from "@nestjs/mapped-types";
import { CreateSysModuleDto } from "./create-sys-module.dto";

export class UpdateSysModuleDto extends PartialType(CreateSysModuleDto) {}
