import { EntityRoot } from '../entity/root.entity';
import type { EventRoot } from '../event/event.root';

export abstract class AggregateRoot<T> extends EntityRoot<T> {
  private readonly _domainEvents: EventRoot[] = [];

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
