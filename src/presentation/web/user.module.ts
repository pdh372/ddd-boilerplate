import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserAdapter } from '../../module/user/infra/use-case-adapters/create-user-adapter.service';
import { GetUserAdapter } from '../../module/user/infra/use-case-adapters/get-user-adapter.service';
import { TranslatorInfra } from '@infra/translator';
import { DatabaseInfra } from '@infra/database/database.factory';

@Module({
  imports: [TranslatorInfra, DatabaseInfra],
  controllers: [UserController],
  providers: [CreateUserAdapter, GetUserAdapter],
})
export class UserModule {}
