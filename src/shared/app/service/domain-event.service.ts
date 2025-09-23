import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import type { EventRoot } from '@shared/domain/event';

/**
 * Application Service for Domain Event Management
 * Handles cross-cutting concerns for domain events
 */
@Injectable()
export class DomainEventService {
  constructor(private readonly eventBus: EventBus) {}

  /**
   * Publishes domain events from aggregates
   * @param events Domain events to publish
   */
  async publishEvents(events: EventRoot[]): Promise<void> {
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  /**
   * Publishes events from multiple aggregates in a transaction
   * @param aggregatesWithEvents Aggregates containing events
   */
  async publishEventsFromAggregates(aggregatesWithEvents: Array<{ getDomainEvents(): EventRoot[] }>): Promise<void> {
    const allEvents: EventRoot[] = [];

    for (const aggregate of aggregatesWithEvents) {
      const events = aggregate.getDomainEvents();
      allEvents.push(...events);
    }

    await this.publishEvents(allEvents);
  }

  /**
   * Clears domain events from aggregates after publishing
   * @param aggregates Aggregates to clear events from
   */
  clearEventsFromAggregates(aggregates: Array<{ clearDomainEvents(): void }>): void {
    for (const aggregate of aggregates) {
      aggregate.clearDomainEvents();
    }
  }
}
