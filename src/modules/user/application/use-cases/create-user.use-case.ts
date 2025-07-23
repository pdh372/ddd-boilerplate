import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/domain/result';
import { User } from '../../domain/user';
import { UserEmail } from '../../domain/user-email';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { USER_REPOSITORY } from '../../user.tokens';

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserDto, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: CreateUserDto): Promise<Result<User>> {
    const emailOrError = UserEmail.create(request.email);
    if (emailOrError.isFailure) {
      return Result.fail<User>(emailOrError.error!);
    }

    const existingUser = await this.userRepository.findByEmail(
      emailOrError.getValue(),
    );
    if (existingUser) {
      return Result.fail<User>('User already exists with this email');
    }

    const userOrError = User.create({
      email: emailOrError.getValue(),
      name: request.name,
    });

    if (userOrError.isFailure) {
      return Result.fail<User>(userOrError.error!);
    }

    const user = userOrError.getValue();
    await this.userRepository.save(user);

    return Result.ok<User>(user);
  }
}
