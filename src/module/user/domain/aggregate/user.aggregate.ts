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
  private readonly _props: IUserProps;

  // Individual getters with defensive copying
  get id(): IdVO {
    return this._props.id; // IdVO should be immutable
  }

  get email(): UserEmail {
    return this._props.email; // UserEmail should be immutable
  }

  get name(): UserName {
    return this._props.name; // UserName should be immutable
  }

  get createdAt(): Date {
    return new Date(this._props.createdAt); // Defensive copy
  }

  get updatedAt(): Date {
    return new Date(this._props.updatedAt); // Defensive copy
  }

  private constructor(props: IUserProps) {
    super(props.id);
    this._props = props;
  }

  public static create(props: { email: UserEmail; name: UserName }): ResultSpecification<UserAggregate> {
    // Input validation - ensure VOs are valid
    if (!props.email || !props.name) {
      return ResultSpecification.fail({
        errorKey: 'USER_CREATION_MISSING_REQUIRED_FIELDS',
        errorParam: {},
      });
    }

    const now = new Date();

    const userProps: IUserProps = {
      id: IdVO.createPlaceholder(), // Let MongoDB generate ID
      email: props.email,
      name: props.name,
      createdAt: now,
      updatedAt: now,
    };

    const user = new UserAggregate(userProps);

    user.addDomainEvent(new UserCreatedEvent(user));

    return ResultSpecification.ok<UserAggregate>(user);
  }

  public static fromValue(state: IUserProps): UserAggregate {
    return new UserAggregate(state);
  }

  public updateName(name: UserName): ResultSpecification<void> {
    if (!name) {
      return ResultSpecification.fail({
        errorKey: 'USER_UPDATE_NAME_INVALID',
        errorParam: {},
      });
    }

    // Business rule: Don't update if same value
    if (this._props.name.value === name.value) {
      return ResultSpecification.ok<void>();
    }

    // const oldName = this._props.name; // For future domain events
    this._props.name = name;
    this._props.updatedAt = new Date();

    // Domain event for name change
    // this.addDomainEvent(new UserNameChangedEvent(this, oldName, name));

    return ResultSpecification.ok<void>();
  }

  public updateEmail(email: UserEmail): ResultSpecification<void> {
    if (!email) {
      return ResultSpecification.fail({
        errorKey: 'USER_UPDATE_EMAIL_INVALID',
        errorParam: {},
      });
    }

    // Business rule: Don't update if same value
    if (this._props.email.value === email.value) {
      return ResultSpecification.ok<void>();
    }

    // const oldEmail = this._props.email; // For future domain events
    this._props.email = email;
    this._props.updatedAt = new Date();

    // Domain event for email change
    // this.addDomainEvent(new UserEmailChangedEvent(this, oldEmail, email));

    return ResultSpecification.ok<void>();
  }
}
