import { Injectable, Logger } from '@nestjs/common';
import type { AggregateRoot } from '../aggregate/root.aggregate';
import type { EventRoot } from './event.root';

/**
 * Domain Event Publisher
 * Publishes domain events from aggregates after persistence
 */
@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  /**
   * Publish all domain events from an aggregate and clear them
   */
  publishEventsForAggregate(aggregate: AggregateRoot<unknown>): void {
    const events: EventRoot[] = aggregate.domainEvents;

    for (const event of events) {
      // Log domain events (in production you would integrate with real event bus)
      this.logger.log('📢 Domain Event Published', {
        eventType: event.constructor.name,
        aggregateId: event.getAggregateId(),
        occurredOn: event.occurredOn,
      });
    }

    // Clear events after publishing
    aggregate.clearEvents();
  }

  /**
   * Publish multiple aggregates' events
   */
  publishEventsForAggregates(aggregates: AggregateRoot<unknown>[]): void {
    for (const aggregate of aggregates) {
      this.publishEventsForAggregate(aggregate);
    }
  }
}
