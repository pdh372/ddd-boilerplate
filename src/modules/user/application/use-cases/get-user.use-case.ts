import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/domain/result';
import { User } from '../../domain/user';
import { UserId } from '../../domain/user-id';
import { UserRepository } from '../../domain/user.repository';
import { USER_REPOSITORY } from '../../user.tokens';

export interface GetUserRequest {
  userId: string;
}

@Injectable()
export class GetUserUseCase implements UseCase<GetUserRequest, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: GetUserRequest): Promise<Result<User>> {
    const userId = UserId.create(request.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail<User>('User not found');
    }

    return Result.ok<User>(user);
  }
}
