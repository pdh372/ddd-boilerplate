import { AggregateRoot } from '@shared/domain/aggregate';
import { ResultSpecification } from '@shared/domain/specification';

import { UserCreatedEvent } from '../event';
import { type UserEmail, type UserName, UserId } from '../vo';

interface IUserState {
  id: UserId;
  email: UserEmail;
  name: UserName;
  createdAt: Date;
  updatedAt: Date;
}

export class UserAggregate extends AggregateRoot<UserId> {
  private state: IUserState;

  get email(): UserEmail {
    return this.state.email;
  }

  get name(): UserName {
    return this.state.name;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }

  get updatedAt(): Date {
    return this.state.updatedAt;
  }

  private constructor(props: IUserState) {
    super(props.id);
    this.state = props;
  }

  public static create(props: Omit<IUserState, 'createdAt' | 'updatedAt' | 'id'>): ResultSpecification<UserAggregate> {
    const now = new Date();
    const userId = UserId.generate();

    const userProps: IUserState = {
      ...props,
      createdAt: now,
      updatedAt: now,
      id: userId.getValue,
    };

    const user = new UserAggregate(userProps);

    user.addDomainEvent(new UserCreatedEvent(user));

    return ResultSpecification.ok<UserAggregate>(user);
  }

  public static fromValue(state: IUserState): UserAggregate {
    return new UserAggregate(state);
  }

  public updateName(name: UserName): void {
    this.state.name = name;
    this.state.updatedAt = new Date();
  }
}
