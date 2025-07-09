import { PartialType } from "@nestjs/mapped-types";
import { CreateSysOperatorDto } from "./create-sys-operator.dto";

export class UpdateSysOperatorDto extends PartialType(CreateSysOperatorDto) {}
