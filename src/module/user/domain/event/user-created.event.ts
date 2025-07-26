import { DomainEvent } from '../../../../shared/domain/domain-event';
import { User } from '../user';

export class UserCreatedEvent implements DomainEvent {
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
