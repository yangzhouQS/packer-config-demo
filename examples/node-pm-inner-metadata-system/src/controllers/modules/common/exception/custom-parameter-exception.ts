import { HttpException, HttpStatus } from "@nestjs/common";

export class CustomParameterException extends HttpException {
  constructor(message: string) {
    super({ errorCode: "MissingParameter", message }, HttpStatus.BAD_REQUEST);
  }
}
