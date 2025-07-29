import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserUseCase, GetUserUseCase } from './app/use-case';
import { USER_REPOSITORY } from './user.token';
import { TranslatorInfra } from '@shared/infra';

@Module({
  imports: [TranslatorInfra],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    {
      provide: USER_REPOSITORY,
      useValue: {},
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
