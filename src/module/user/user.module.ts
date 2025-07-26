import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserUseCase } from './application/use-case/create-user.use-case';
import { GetUserUseCase } from './application/use-case/get-user.use-case';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
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
