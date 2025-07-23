import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { Result } from '../../../shared/domain/result';
import { UserId } from './user-id';
import { UserEmail } from './user-email';
import { UserCreatedEvent } from './events/user-created.event';

interface UserProps {
  email: UserEmail;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserId> {
  private props: UserProps;

  get email(): UserEmail {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: UserProps, id: UserId) {
    super(id);
    this.props = props;
  }

  public static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt'> | UserProps,
    id?: UserId,
  ): Result<User> {
    const now = new Date();
    const userProps: UserProps = {
      ...props,
      createdAt: 'createdAt' in props ? props.createdAt : now,
      updatedAt: 'updatedAt' in props ? props.updatedAt : now,
    };

    const userId = id ?? UserId.create(Math.random().toString(36).substr(2, 9));
    const user = new User(userProps, userId);

    if (!id) {
      user.addDomainEvent(new UserCreatedEvent(user));
    }

    return Result.ok<User>(user);
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }
}
