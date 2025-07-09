import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserTestService } from "./user-test.service";

@Controller("user-test")
export class UserTestController {
  constructor(private readonly userTestService: UserTestService) {}

  @Post("create")
  create(@Body() body: any) {
    console.log(body);
    return this.userTestService.create();
  }

  @Get("test-user")
  findAll() {
    return this.userTestService.findAll();
  }

  @Get("test-user-by-id")
  findOne(@Body() body: any) {
    console.log(body);
    return this.userTestService.testUserById();
  }
}
