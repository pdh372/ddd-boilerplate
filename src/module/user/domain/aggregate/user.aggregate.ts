import { AggregateRoot, LocalizedResult } from '@shared/domain';
import { UserId, UserEmail } from '../vo';
import { UserCreatedEvent } from '../event';

interface UserProps {
  email: UserEmail;

  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserId> {
  private state: UserProps;

  get email(): UserEmail {
    return this.state.email;
  }

  get name(): string {
    return this.state.name;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }

  get updatedAt(): Date {
    return this.state.updatedAt;
  }

  private constructor(props: UserProps, id: UserId) {
    super(id);
    this.state = props;
  }

  public static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>): LocalizedResult<User> {
    const now = new Date();
    const userProps: UserProps = {
      ...props,
      createdAt: now,
      updatedAt: now,
    };

    const userId = UserId.create();
    const user = new User(userProps, userId);

    user.addDomainEvent(new UserCreatedEvent(user));

    return LocalizedResult.ok<User>(user);
  }

  public updateName(name: string): void {
    this.state.name = name;
    this.state.updatedAt = new Date();
  }
}
