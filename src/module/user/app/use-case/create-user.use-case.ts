import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '@shared/app/use-case';
import { UserAggregate, UserEmail, IUserRepository } from '@module/user/domain';
import { CreateUserDto } from '../dto';
import { USER_REPOSITORY } from '../../user.token';
import { ExecutionContextSpecification, ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_REPOSITORY, TranslatorRepository } from '@shared/domain/repository';

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserDto, UserAggregate> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    @Inject(TRANSLATOR_REPOSITORY) private readonly _translatorRepository: TranslatorRepository,
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
