import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '@shared/app/use-case';
import { LocalizedResult, ExecutionContext, TranslatorDomain } from '@shared/domain';
import { User, UserEmail, UserRepository } from '../../domain';
import { CreateUserDto } from '../dto';
import { USER_REPOSITORY } from '../../user.token';
import { TRANSLATOR_TOKEN } from '@shared/infra';

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserDto, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly _userRepository: UserRepository,
    @Inject(TRANSLATOR_TOKEN) private readonly _translatorService: TranslatorDomain,
  ) {}

  async execute(
    request: CreateUserDto,
    context: ExecutionContext = ExecutionContext.create({}),
  ): Promise<LocalizedResult<User>> {
    const email = UserEmail.create(request.email);
    if (email.isFailure) {
      return LocalizedResult.fail<User>({
        errorKey: email.errorKey,
        errorParam: email.errorParam,
      });
    }

    const existingUser = await this._userRepository.findByEmail(email.getValue);
    if (existingUser) {
      return LocalizedResult.fail<User>({ errorKey: 'error.user.email_already_exists' });
    }

    const newUser = User.create({
      email: email.getValue,
      name: request.name,
    });

    if (newUser.isFailure) {
      return LocalizedResult.fail<User>({
        errorKey: newUser.errorKey,
        errorParam: newUser.errorParam,
      });
    }

    const user = newUser.getValue;
    await this._userRepository.save(user);

    return LocalizedResult.ok<User>(user);
  }
}
