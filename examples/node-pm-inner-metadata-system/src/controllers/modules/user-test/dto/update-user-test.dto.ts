import { PartialType } from "@nestjs/mapped-types";
import { CreateUserTestDto } from "./create-user-test.dto";

export class UpdateUserTestDto extends PartialType(CreateUserTestDto) {}
