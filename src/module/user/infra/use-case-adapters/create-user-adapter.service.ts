import { Injectable, Inject } from '@nestjs/common';
import { CreateUserUseCase } from '../../app/use-case/create-user.use-case';
import { USER_REPOSITORY } from '../../user.token';
import { TRANSLATOR_REPOSITORY, type TranslatorRepository } from '@shared/domain/repo';
import type { IUserRepository } from '@module/user/domain';

@Injectable()
export class CreateUserAdapter extends CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) userRepository: IUserRepository,
    @Inject(TRANSLATOR_REPOSITORY) translatorRepository: TranslatorRepository,
  ) {
    super(userRepository, translatorRepository);
  }
}
