import { CustomRepository, InjectRepository } from "@cs/nest-typeorm";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository({
      entity: UserEntity,
    })
    private readonly userRepository: CustomRepository<UserEntity>,
  ) {}

  async findOne(userDto: Partial<UserEntity>): Promise<UserEntity> {
    // 从user和sys_operator表中查询用户信息
    const result = await this.userRepository.executeSql(
      `SELECT u.id, u.name, u.password, u.login_id
      FROM user u
      INNER JOIN sys_operator so ON u.id = so.user_id
      WHERE u.login_id = :loginId`,
      {
        loginId: userDto.loginId,
      },
    );
    if (result.length > 0) {
      return result[0];
    }
    return null;
  }
}
