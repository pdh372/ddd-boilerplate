import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '@shared/app/use-case';
import { LocalizedResult, TranslatorDomain, ExecutionContext } from '@shared/domain/specification';
import { User, UserId, UserRepository } from '@module/user/domain';
import { USER_REPOSITORY } from '../../user.token';
import { TRANSLATOR_TOKEN } from '@shared/infra';

export interface GetUserRequest {
  userId: string;
}

@Injectable()
export class GetUserUseCase implements UseCase<GetUserRequest, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly _userRepository: UserRepository,
    @Inject(TRANSLATOR_TOKEN) private readonly _translatorService: TranslatorDomain,
  ) {}

  async execute(
    request: GetUserRequest,
    context: ExecutionContext = ExecutionContext.create({}),
  ): Promise<LocalizedResult<User>> {
    const userId = UserId.create();
    const user = await this._userRepository.findById(userId);

    if (!user) {
      return LocalizedResult.fail<User>({ errorKey: 'error.user.not_found' });
    }

    return LocalizedResult.ok<User>(user);
  }
}
