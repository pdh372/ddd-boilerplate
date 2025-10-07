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

    const existingUserResult = await this._userRepository.findByEmail(email.getValue);
    if (existingUserResult.isFailure) {
      return ResultSpecification.fail<UserAggregate>(existingUserResult.error);
    }

    if (existingUserResult.getValue) {
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

    try {
      // Save aggregate to DB
      const savedResult = await this._userRepository.save(user);

      if (savedResult.isFailure) {
        return ResultSpecification.fail<UserAggregate>(savedResult.error);
      }

      const userSaved = savedResult.getValue;

      // Publish domain events (e.g., UserCreatedEvent)
      // If this fails, the exception will be caught and handled
      await this._domainEventService.publishEvents(userSaved.domainEvents);

      // Clear events after successful publishing
      userSaved.clearEvents();

      return ResultSpecification.ok<UserAggregate>(userSaved);
    } catch (error) {
      // If event publishing fails, the repository save will need to be rolled back
      // For now, we return a failure result
      // TODO: Implement proper transaction rollback with database transaction manager
      return ResultSpecification.fail<UserAggregate>({
        errorKey: TRANSLATOR_KEY.ERROR__USER__CREATION_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }
}
