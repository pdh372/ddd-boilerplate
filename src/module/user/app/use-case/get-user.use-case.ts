import { type IUserRepository, type UserAggregate, UserId } from '@module/user/domain';

import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

export interface IGetUserRequest {
  userId: string;
}

export class GetUserUseCase implements UseCase<IGetUserRequest, UserAggregate> {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(input: IGetUserRequest): Promise<ResultSpecification<UserAggregate>> {
    const user = await this._userRepository.findById(UserId.fromValue(input.userId));

    if (!user) {
      return ResultSpecification.fail<UserAggregate>({ errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND });
    }

    return ResultSpecification.ok<UserAggregate>(user);
  }
}
