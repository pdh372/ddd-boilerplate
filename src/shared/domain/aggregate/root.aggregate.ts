import { EntityRoot } from '../entity/root.entity';
import { EventRoot } from '../event/event.root';

export abstract class AggregateRoot<T> extends EntityRoot<T> {
  private _domainEvents: EventRoot[] = [];

  public get domainEvents(): EventRoot[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: EventRoot): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }
}
