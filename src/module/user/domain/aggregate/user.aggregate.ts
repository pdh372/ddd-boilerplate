import { AggregateRoot } from '@shared/domain/aggregate';
import { ResultSpecification } from '@shared/domain/specification';

import { UserCreatedEvent } from '../event';
import { type UserEmail, UserId } from '../vo';

interface IUserState {
  email: UserEmail;

  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserAggregate extends AggregateRoot<UserId> {
  private state: IUserState;

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

  private constructor(props: IUserState, id: UserId) {
    super(id);
    this.state = props;
  }

  public static create(props: Omit<IUserState, 'createdAt' | 'updatedAt'>): ResultSpecification<UserAggregate> {
    const now = new Date();
    const userProps: IUserState = {
      ...props,
      createdAt: now,
      updatedAt: now,
    };

    const userId = UserId.generate();
    const user = new UserAggregate(userProps, userId);

    user.addDomainEvent(new UserCreatedEvent(user));

    return ResultSpecification.ok<UserAggregate>(user);
  }

  public updateName(name: string): void {
    this.state.name = name;
    this.state.updatedAt = new Date();
  }
}
