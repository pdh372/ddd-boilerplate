import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '@shared/app/use-case';
import { ExecutionContextSpecification, ResultSpecification } from '@shared/domain/specification';
import { UserAggregate, UserId, IUserRepository } from '@module/user/domain';
import { USER_REPOSITORY } from '../../user.token';

export interface IGetUserRequest {
  userId: string;
}

@Injectable()
export class GetUserUseCase implements UseCase<IGetUserRequest, UserAggregate> {
  constructor(@Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository) {}

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
