import { type IUserRepository, type UserAggregate } from '@module/user/domain';

import type { UseCase } from '@shared/app/use-case';
import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';
import { IdVO } from '@shared/domain/vo';

export interface IGetUserRequest {
  userId: string;
}

export class GetUserUseCase implements UseCase<IGetUserRequest, UserAggregate> {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(input: IGetUserRequest): Promise<Result<UserAggregate>> {
    const userId = IdVO.validate(input.userId);
    if (userId.isFailure) {
      return Result.fail<UserAggregate>({
        errorKey: userId.errorKey,
        errorParam: userId.errorParam,
      });
    }

    const userResult = await this._userRepository.findById(userId.getValue);

    if (userResult.isFailure) {
      return Result.fail<UserAggregate>(userResult.error);
    }

    const user = userResult.getValue;
    if (!user) {
      return Result.fail<UserAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
      });
    }

    return Result.ok<UserAggregate>(user);
  }
}
