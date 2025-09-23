import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import type { AggregateRoot } from '../aggregate/root.aggregate';

/**
 * Domain Event Publisher
 * Publishes domain events from aggregates after persistence
 */
@Injectable()
export class DomainEventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  /**
   * Publish all domain events from an aggregate and clear them
   */
  publishEventsForAggregate(aggregate: AggregateRoot<any>): void {
    const events = aggregate.domainEvents;

    for (const event of events) {
      // Publish event to the event bus (fire and forget)
      this.eventBus.publish(event);
    }

    // Clear events after publishing
    aggregate.clearEvents();
  }

  /**
   * Publish multiple aggregates' events
   */
  publishEventsForAggregates(aggregates: AggregateRoot<any>[]): void {
    for (const aggregate of aggregates) {
      this.publishEventsForAggregate(aggregate);
    }
  }
}
