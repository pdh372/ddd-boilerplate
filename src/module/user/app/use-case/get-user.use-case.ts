import { type IUserRepository, type UserAggregate, UserId } from '@module/user/domain';

import type { UseCase } from '@shared/app/use-case';
import { type ExecutionContextSpecification, ResultSpecification } from '@shared/domain/specification';

export interface IGetUserRequest {
  userId: string;
}

export class GetUserUseCase implements UseCase<IGetUserRequest, UserAggregate> {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(input: {
    req: IGetUserRequest;
    ctx: ExecutionContextSpecification;
  }): Promise<ResultSpecification<UserAggregate>> {
    const user = await this._userRepository.findById(UserId.fromValue(input.req.userId));

    if (!user) {
      return ResultSpecification.fail<UserAggregate>({ errorKey: 'error.user.not_found' });
    }

    return ResultSpecification.ok<UserAggregate>(user);
  }
}
