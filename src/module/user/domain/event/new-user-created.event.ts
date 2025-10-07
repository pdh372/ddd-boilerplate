import type { EventRoot } from '@shared/domain/event';

import type { UserAggregate } from '../aggregate/user.aggregate';

export class UserCreatedEvent implements EventRoot {
  public occurredOn: Date;
  public user: UserAggregate;

  constructor(user: UserAggregate) {
    this.occurredOn = new Date();
    this.user = user;
  }

  getAggregateId(): string {
    return this.user.id.value;
  }
}
