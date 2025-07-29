import { Injectable, Inject } from '@nestjs/common';
import { GetUserUseCase } from '../../app/use-case/get-user.use-case';
import { USER_REPOSITORY } from '../../user.token';
import type { IUserRepository } from '@module/user/domain';

@Injectable()
export class GetUserAdapter extends GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) userRepository: IUserRepository,
  ) {
    super(userRepository);
  }
}