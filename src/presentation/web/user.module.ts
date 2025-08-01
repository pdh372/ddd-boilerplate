import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../../module/user/app/use-case/create-user.use-case';
import { GetUserUseCase } from '../../module/user/app/use-case/get-user.use-case';
import { TranslatorInfra } from '@infra/translator';
import { DatabaseInfra } from '@infra/database/database.factory';
import { USER_REPOSITORY } from '../../module/user/user.token';
import { ITranslatorRepository } from '@shared/domain/repo';
import { IUserRepository } from '@module/user/domain';
import { TRANSLATOR_REPOSITORY } from '../../infra/translator/translator.token';

@Module({
  imports: [TranslatorInfra, DatabaseInfra],
  controllers: [UserController],
  providers: [
    {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY, TRANSLATOR_REPOSITORY],
      useFactory: (userRepo: IUserRepository, translator: ITranslatorRepository) => {
        return new CreateUserUseCase(userRepo, translator);
      },
    },
    {
      provide: GetUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (userRepo: IUserRepository) => {
        return new GetUserUseCase(userRepo);
      },
    },
  ],
})
export class UserModule {}
