import { PartialType } from "@nestjs/mapped-types";
import { CreateSysProductDto } from "./create-sys-product.dto";

export class UpdateSysProductDto extends PartialType(CreateSysProductDto) {}
