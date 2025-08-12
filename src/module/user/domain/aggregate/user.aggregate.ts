import { AggregateRoot } from '@shared/domain/aggregate';
import { ResultSpecification } from '@shared/domain/specification';
import { IdVO } from '@shared/domain/vo';

import { UserCreatedEvent } from '../event';
import { type UserEmail, type UserName } from '../vo';

interface IUserProps {
  id: IdVO;
  email: UserEmail;
  name: UserName;
  createdAt: Date;
  updatedAt: Date;
}

export class UserAggregate extends AggregateRoot<IdVO> {
  private _props: IUserProps;

  get props(): IUserProps {
    return this._props;
  }

  private constructor(props: IUserProps) {
    super(props.id);
    this._props = props;
  }

  public static create(props: Omit<IUserProps, 'createdAt' | 'updatedAt' | 'id'>): ResultSpecification<UserAggregate> {
    const now = new Date();

    const userProps: IUserProps = {
      ...props,
      createdAt: now,
      updatedAt: now,
      id: IdVO.fromValueCreation(),
    };

    const user = new UserAggregate(userProps);

    user.addDomainEvent(new UserCreatedEvent(user));

    return ResultSpecification.ok<UserAggregate>(user);
  }

  public static fromValue(state: IUserProps): UserAggregate {
    return new UserAggregate(state);
  }

  public updateName(name: UserName): void {
    this._props.name = name;
    this._props.updatedAt = new Date();
  }
}
