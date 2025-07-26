import { Mapper } from '@shared/application/mapper';
import { User, UserId, UserEmail } from '../domain';

export interface UserPersistence {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper extends Mapper<User> {
  toDomain(raw: UserPersistence): User {
    const emailOrError = UserEmail.create(raw.email);
    if (emailOrError.isFailure) {
      throw new Error('Invalid email in persistence data');
    }

    const userOrError = User.create(
      {
        email: emailOrError.getValue(),
        name: raw.name,
      },
      UserId.create(raw.id),
    );

    if (userOrError.isFailure) {
      throw new Error('Failed to create user from persistence data');
    }

    return userOrError.getValue();
  }

  toPersistence(user: User): UserPersistence {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
