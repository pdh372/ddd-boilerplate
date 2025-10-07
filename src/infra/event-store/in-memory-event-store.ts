import { Injectable, Logger } from '@nestjs/common';
import type { IEventStore, StoredDomainEvent } from '@shared/domain/event-store';
import type { EventRoot } from '@shared/domain/event';
import { ResultSpecification } from '@shared/domain/specification';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-Memory Event Store Implementation
 * For production, replace with persistent storage (MongoDB, PostgreSQL, etc.)
 */
@Injectable()
export class InMemoryEventStore implements IEventStore {
  private readonly logger = new Logger(InMemoryEventStore.name);
  private readonly events: StoredDomainEvent[] = [];
  private readonly snapshots: Map<string, { snapshot: Record<string, unknown>; version: number }> = new Map();
  private globalVersion = 0;

  appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: EventRoot[],
    expectedVersion?: number,
  ): Promise<ResultSpecification<void>> {
    try {
      // Optimistic concurrency check
      if (expectedVersion !== undefined) {
        const currentVersion = this.getCurrentVersion(aggregateId);
        if (currentVersion !== expectedVersion) {
          return Promise.resolve(
            ResultSpecification.fail({
              errorKey: 'EVENT_STORE_CONCURRENCY_ERROR',
              errorParam: { expected: expectedVersion, current: currentVersion },
            }),
          );
        }
      }

      // Convert domain events to stored events
      const storedEvents: StoredDomainEvent[] = events.map((event, index) => {
        const currentVersion = this.getCurrentVersion(aggregateId);
        return {
          ...event,
          aggregateId,
          aggregateType,
          eventType: event.constructor.name,
          eventVersion: currentVersion + index + 1,
          eventId: uuidv4(),
          eventData: this.serializeEvent(event),
          metadata: {
            timestamp: event.occurredOn,
            userId: 'system', // Could be extracted from execution context
          },
        };
      });

      // Append to store
      this.events.push(...storedEvents);
      this.globalVersion += events.length;

      this.logger.debug(`Appended ${events.length} events for aggregate ${aggregateId}`);
      return Promise.resolve(ResultSpecification.ok());
    } catch (error) {
      this.logger.error('Failed to append events:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_APPEND_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  getEventsForAggregate(aggregateId: string, fromVersion?: number): Promise<ResultSpecification<StoredDomainEvent[]>> {
    try {
      const events = this.events
        .filter((event) => event.aggregateId === aggregateId)
        .filter((event) => fromVersion === undefined || event.eventVersion > fromVersion)
        .sort((a, b) => a.eventVersion - b.eventVersion);

      this.logger.debug(`Retrieved ${events.length} events for aggregate ${aggregateId}`);
      return Promise.resolve(ResultSpecification.ok(events));
    } catch (error) {
      this.logger.error('Failed to get events for aggregate:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_GET_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  getEventsByType(eventType: string, fromVersion?: number): Promise<ResultSpecification<StoredDomainEvent[]>> {
    try {
      const events = this.events
        .filter((event) => event.eventType === eventType)
        .filter((event) => fromVersion === undefined || event.eventVersion > fromVersion)
        .sort((a, b) => a.eventVersion - b.eventVersion);

      this.logger.debug(`Retrieved ${events.length} events of type ${eventType}`);
      return Promise.resolve(ResultSpecification.ok(events));
    } catch (error) {
      this.logger.error('Failed to get events by type:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_GET_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  getAllEvents(fromVersion?: number, toVersion?: number): Promise<ResultSpecification<StoredDomainEvent[]>> {
    try {
      const events = this.events
        .filter((event) => fromVersion === undefined || event.eventVersion > fromVersion)
        .filter((event) => toVersion === undefined || event.eventVersion <= toVersion)
        .sort((a, b) => a.eventVersion - b.eventVersion);

      this.logger.debug(`Retrieved ${events.length} events from store`);
      return Promise.resolve(ResultSpecification.ok(events));
    } catch (error) {
      this.logger.error('Failed to get all events:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_GET_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  async getEventsForAggregates(
    aggregateIds: string[],
  ): Promise<ResultSpecification<Record<string, StoredDomainEvent[]>>> {
    try {
      const result: Record<string, StoredDomainEvent[]> = {};

      for (const aggregateId of aggregateIds) {
        const eventsResult = await this.getEventsForAggregate(aggregateId);
        if (eventsResult.isFailure) {
          return ResultSpecification.fail(eventsResult.error);
        }
        result[aggregateId] = eventsResult.getValue;
      }

      return ResultSpecification.ok(result);
    } catch (error) {
      this.logger.error('Failed to get events for aggregates:', error);
      return ResultSpecification.fail({
        errorKey: 'EVENT_STORE_GET_ERROR',
        errorParam: { error: String(error) },
      });
    }
  }

  saveSnapshot(
    aggregateId: string,
    aggregateType: string,
    snapshot: Record<string, unknown>,
    version: number,
  ): Promise<ResultSpecification<void>> {
    try {
      this.snapshots.set(aggregateId, { snapshot, version });
      this.logger.debug(`Saved snapshot for aggregate ${aggregateId} at version ${version}`);
      return Promise.resolve(ResultSpecification.ok());
    } catch (error) {
      this.logger.error('Failed to save snapshot:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_SNAPSHOT_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  getSnapshot(
    aggregateId: string,
  ): Promise<ResultSpecification<{ snapshot: Record<string, unknown>; version: number } | null>> {
    try {
      const snapshot = this.snapshots.get(aggregateId) ?? null;
      this.logger.debug(`Retrieved snapshot for aggregate ${aggregateId}: ${snapshot ? 'found' : 'not found'}`);
      return Promise.resolve(ResultSpecification.ok(snapshot));
    } catch (error) {
      this.logger.error('Failed to get snapshot:', error);
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'EVENT_STORE_SNAPSHOT_ERROR',
          errorParam: { error: String(error) },
        }),
      );
    }
  }

  /**
   * Helper method to get current version of an aggregate
   */
  private getCurrentVersion(aggregateId: string): number {
    const events = this.events.filter((event) => event.aggregateId === aggregateId);
    return events.length > 0 ? Math.max(...events.map((e) => e.eventVersion)) : 0;
  }

  /**
   * Serialize domain event to plain object
   */
  private serializeEvent(event: EventRoot): Record<string, unknown> {
    return {
      ...event,
      eventType: event.constructor.name,
    };
  }

  /**
   * Development helper: Clear all events (for testing)
   */
  clearAll(): void {
    this.events.length = 0;
    this.snapshots.clear();
    this.globalVersion = 0;
    this.logger.warn('All events and snapshots cleared');
  }
}
