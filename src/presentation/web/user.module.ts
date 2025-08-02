import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { USE_CASE } from '@infra/use-case';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [USE_CASE.USER.CREATE_USER, USE_CASE.USER.GET_USER],
})
export class UserModule {}
