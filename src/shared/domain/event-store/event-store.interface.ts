import type { EventRoot } from '@shared/domain/event';
import type { Result } from '@shared/domain/specification';

/**
 * Event Store dependency injection token
 */
export const EVENT_STORE = Symbol('EVENT_STORE');

/**
 * Domain Event with metadata for Event Store
 */
export interface StoredDomainEvent extends EventRoot {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventVersion: number;
  eventId: string;
  eventData: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Event Store Interface - Repository for Domain Events
 * Provides event persistence, retrieval, and replay capabilities
 */
export interface IEventStore {
  /**
   * Append events to an aggregate's event stream
   * @param aggregateId The aggregate identifier
   * @param aggregateType The type of aggregate (User, Order, etc.)
   * @param events Events to append
   * @param expectedVersion Expected version for optimistic concurrency
   */
  appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: EventRoot[],
    expectedVersion?: number,
  ): Promise<Result<void>>;

  /**
   * Get all events for a specific aggregate
   * @param aggregateId The aggregate identifier
   * @param fromVersion Start from this version (optional)
   */
  getEventsForAggregate(aggregateId: string, fromVersion?: number): Promise<Result<StoredDomainEvent[]>>;

  /**
   * Get all events of a specific type
   * @param eventType The event type to filter by
   * @param fromVersion Start from this version (optional)
   */
  getEventsByType(eventType: string, fromVersion?: number): Promise<Result<StoredDomainEvent[]>>;

  /**
   * Get all events in the store
   * @param fromVersion Start from this version (optional)
   * @param toVersion End at this version (optional)
   */
  getAllEvents(fromVersion?: number, toVersion?: number): Promise<Result<StoredDomainEvent[]>>;

  /**
   * Get events for multiple aggregates (batch operation)
   * @param aggregateIds Array of aggregate identifiers
   */
  getEventsForAggregates(aggregateIds: string[]): Promise<Result<Record<string, StoredDomainEvent[]>>>;

  /**
   * Save a snapshot of an aggregate
   * @param aggregateId The aggregate identifier
   * @param aggregateType The type of aggregate
   * @param snapshot The aggregate snapshot data
   * @param version The version at which snapshot was taken
   */
  saveSnapshot(
    aggregateId: string,
    aggregateType: string,
    snapshot: Record<string, unknown>,
    version: number,
  ): Promise<Result<void>>;

  /**
   * Get the latest snapshot for an aggregate
   * @param aggregateId The aggregate identifier
   */
  getSnapshot(
    aggregateId: string,
  ): Promise<Result<{ snapshot: Record<string, unknown>; version: number } | null>>;
}
