import { type IUserRepository, UserAggregate, UserEmail } from '@module/user/domain';

import type { UseCase } from '@shared/app/use-case';
import type { TranslatorRepository } from '@shared/domain/repo';
import { type ExecutionContextSpecification, ResultSpecification } from '@shared/domain/specification';

import type { CreateUserDto } from '../dto';

export class CreateUserUseCase implements UseCase<CreateUserDto, UserAggregate> {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _translatorRepository: TranslatorRepository,
  ) {}

  async execute(input: {
    req: CreateUserDto;
    ctx: ExecutionContextSpecification;
  }): Promise<ResultSpecification<UserAggregate>> {
    const email = UserEmail.create(input.req.email);
    if (email.isFailure) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: email.errorKey,
        errorParam: email.errorParam,
      });
    }

    const existingUser = await this._userRepository.findByEmail(email.getValue);
    if (existingUser) {
      return ResultSpecification.fail<UserAggregate>({ errorKey: 'error.user.email_already_exists' });
    }

    const newUser = UserAggregate.create({
      email: email.getValue,
      name: input.req.name,
    });

    if (newUser.isFailure) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: newUser.errorKey,
        errorParam: newUser.errorParam,
      });
    }

    const user = newUser.getValue;
    await this._userRepository.save(user);

    return ResultSpecification.ok<UserAggregate>(user);
  }
}
