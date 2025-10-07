import { type IUserRepository, UserAggregate, UserEmail, UserName } from '@module/user/domain';
import type { UseCase } from '@shared/app/use-case';
import { ResultSpecification } from '@shared/domain/specification';
import type { ICreateUserDto } from '../dto';
import { TRANSLATOR_KEY } from '@shared/translator';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export class CreateUserUseCase implements UseCase<ICreateUserDto, UserAggregate> {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _domainEventService: DomainEventService,
  ) {}

  async execute(input: ICreateUserDto): Promise<ResultSpecification<UserAggregate>> {
    const email = UserEmail.validate(input.email);
    if (email.isFailure) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: email.errorKey,
        errorParam: email.errorParam,
      });
    }

    const name = UserName.validate(input.name);
    if (name.isFailure) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: name.errorKey,
        errorParam: name.errorParam,
      });
    }

    const existingUser = await this._userRepository.findByEmail(email.getValue);
    if (existingUser) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__EMAIL_ALREADY_EXISTS,
      });
    }

    const newUserResult = UserAggregate.create({
      email: email.getValue,
      name: name.getValue,
    });

    if (newUserResult.isFailure) {
      return ResultSpecification.fail<UserAggregate>({
        errorKey: newUserResult.errorKey,
        errorParam: newUserResult.errorParam,
      });
    }

    const user = newUserResult.getValue;
    const userSaved = await this._userRepository.save(user);

    // Publish domain events (e.g., UserCreatedEvent)
    await this._domainEventService.publishEvents(userSaved.domainEvents);

    // Clear events after publishing
    userSaved.clearEvents();

    return ResultSpecification.ok<UserAggregate>(userSaved);
  }
}
