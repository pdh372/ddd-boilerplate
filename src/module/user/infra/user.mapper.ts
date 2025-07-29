import { Mapper } from '@shared/app/mapper';

import { UserAggregate, UserEmail } from '../domain';

export interface UserPersistence {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper extends Mapper<UserAggregate> {
  toDomain(raw: UserPersistence): UserAggregate {
    const emailOrError = UserEmail.create(raw.email);
    if (emailOrError.isFailure) {
      throw new Error('Invalid email in persistence data');
    }

    const userOrError = UserAggregate.create({
      email: emailOrError.getValue,
      name: raw.name,
    });

    if (userOrError.isFailure) {
      throw new Error('Failed to create user from persistence data');
    }

    return userOrError.getValue;
  }

  toPersistence(user: UserAggregate): UserPersistence {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
