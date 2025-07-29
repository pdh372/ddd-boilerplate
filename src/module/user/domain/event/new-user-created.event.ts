import { EventRoot } from '@shared/domain';
import { User } from '../aggregate/user.aggregate';

export class UserCreatedEvent implements EventRoot {
  public occurredOn: Date;
  public user: User;

  constructor(user: User) {
    this.occurredOn = new Date();
    this.user = user;
  }

  getAggregateId(): string {
    return this.user.id.value;
  }
}
