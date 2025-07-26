import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserUseCase, GetUserUseCase } from './app/use-case';
import { InMemoryUserRepository } from './infra';
import { USER_REPOSITORY } from './user.token';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
