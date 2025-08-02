import { USER_REPOSITORY } from '@module/user/user.token';
import type { IUserRepository } from '@module/user/domain';
import { GetUserUseCase, CreateUserUseCase } from '@module/user/app/use-case';

export const USE_CASE = {
  USER: {
    CREATE_USER: {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (userRepo: IUserRepository) => {
        return new CreateUserUseCase(userRepo);
      },
    },
    GET_USER: {
      provide: GetUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (userRepo: IUserRepository) => {
        return new GetUserUseCase(userRepo);
      },
    },
  },
};
