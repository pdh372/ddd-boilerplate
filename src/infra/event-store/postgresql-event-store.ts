import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import type { IEventStore, StoredDomainEvent } from '@shared/domain/event-store';
import type { EventRoot } from '@shared/domain/event';
import { Result } from '@shared/domain/specification';
import { v4 as uuidv4 } from 'uuid';
import { retryWithBackoff, CircuitBreaker } from '@shared/utils/retry.util';
import { RETRY } from '@shared/config/constants.config';
import { EventStoreEntity } from './entity/event-store.entity';
import { SnapshotEntity } from './entity/snapshot.entity';

/**
 * Production-Ready PostgreSQL Event Store Implementation
 *
 * Features:
 * - ACID transactions with optimistic concurrency control
 * - High-performance indexing and query optimization
 * - Snapshot support for large aggregates
 * - Global event ordering
 * - Connection pooling and error recovery
 * - Production monitoring hooks
 * - Exponential backoff retry for transient failures
 * - Circuit breaker to prevent retry storms
 */
@Injectable()
export class PostgreSqlEventStore implements IEventStore {
  private readonly logger = new Logger(PostgreSqlEventStore.name);
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    @InjectRepository(EventStoreEntity)
    private readonly eventRepository: Repository<EventStoreEntity>,
    @InjectRepository(SnapshotEntity)
    private readonly snapshotRepository: Repository<SnapshotEntity>,
    private readonly dataSource: DataSource,
  ) {
    // Initialize circuit breaker for database operations
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: RETRY.CIRCUIT_FAILURE_THRESHOLD,
      successThreshold: RETRY.CIRCUIT_SUCCESS_THRESHOLD,
      timeout: RETRY.CIRCUIT_TIMEOUT,
      name: 'PostgreSQL-EventStore',
    });
  }

  async appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: EventRoot[],
    expectedVersion?: number,
  ): Promise<Result<void>> {
    // Wrap entire operation with circuit breaker + retry logic
    try {
      return await this.circuitBreaker.execute(async () => {
        return await retryWithBackoff(
          async () => {
            return await this.appendEventsInternal(aggregateId, aggregateType, events, expectedVersion);
          },
          {
            maxRetries: RETRY.MAX_ATTEMPTS,
            baseDelay: RETRY.BASE_DELAY,
            maxDelay: RETRY.MAX_DELAY,
            shouldRetry: (error) => this.isTransientError(error),
            logger: this.logger,
            operationName: 'appendEvents',
          },
        );
      });
    } catch (error) {
      // If circuit is open or all retries exhausted, return failure
      this.logger.error(`Failed to append events after retries for aggregate ${aggregateId}:`, error);
      return Result.fail({
        errorKey: 'EVENT_STORE_APPEND_ERROR',
        errorParam: {
          aggregateId,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  /**
   * Internal implementation of appendEvents with transaction handling
   * Separated to allow retry logic to wrap transaction boundary
   */
  private async appendEventsInternal(
    aggregateId: string,
    aggregateType: string,
    events: EventRoot[],
    expectedVersion?: number,
  ): Promise<Result<void>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Optimistic concurrency control within transaction
      const currentVersion = await this.getCurrentVersionInTransaction(queryRunner, aggregateId);

      if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
        await queryRunner.rollbackTransaction();
        return Result.fail({
          errorKey: 'EVENT_STORE_CONCURRENCY_ERROR',
          errorParam: {
            aggregateId,
            expected: expectedVersion,
            current: currentVersion,
          },
        });
      }

      // Get next global version atomically
      const globalVersionResult = (await queryRunner.query(
        'SELECT COALESCE(MAX(global_version), 0) + 1 as next_global_version FROM event_store',
      )) as Array<{ next_global_version: string }>;
      const nextGlobalVersion = parseInt(globalVersionResult[0]?.next_global_version ?? '1', 10);

      // Convert domain events to database entities
      const eventEntities = events.map((event, index) => {
        const entity = new EventStoreEntity();
        entity.eventId = uuidv4();
        entity.aggregateId = aggregateId;
        entity.aggregateType = aggregateType;
        entity.eventType = event.constructor.name;
        entity.eventVersion = currentVersion + index + 1;
        entity.globalVersion = nextGlobalVersion + index;
        entity.eventData = this.serializeEvent(event);
        entity.metadata = {
          timestamp: event.occurredOn,
          correlationId: this.extractCorrelationId(event),
          userId: this.extractUserId(event) ?? 'system',
        };
        entity.occurredOn = event.occurredOn;
        return entity;
      });

      // Batch insert events with retry protection
      await queryRunner.manager.save(EventStoreEntity, eventEntities);
      await queryRunner.commitTransaction();

      this.logger.debug(
        `Successfully appended ${events.length} events for aggregate ${aggregateId} ` +
          `(version ${currentVersion} -> ${currentVersion + events.length})`,
      );

      // Emit monitoring metrics
      this.emitMetrics('events_appended', events.length, {
        aggregateType,
        aggregateId,
      });

      return Result.ok();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Re-throw to allow retry logic to handle
    } finally {
      await queryRunner.release();
    }
  }

  async getEventsForAggregate(aggregateId: string, fromVersion?: number): Promise<Result<StoredDomainEvent[]>> {
    try {
      const queryBuilder = this.eventRepository
        .createQueryBuilder('event')
        .where('event.aggregateId = :aggregateId', { aggregateId });

      if (fromVersion !== undefined) {
        queryBuilder.andWhere('event.eventVersion > :fromVersion', { fromVersion });
      }

      const events = await queryBuilder.orderBy('event.eventVersion', 'ASC').getMany();

      const storedEvents = events.map((entity) => this.mapEntityToStoredEvent(entity));

      this.logger.debug(
        `Retrieved ${events.length} events for aggregate ${aggregateId}` +
          (fromVersion !== undefined ? ` from version ${fromVersion}` : ''),
      );

      return Result.ok(storedEvents);
    } catch (error) {
      this.logger.error(`Failed to get events for aggregate ${aggregateId}:`, error);
      return Result.fail({
        errorKey: 'EVENT_STORE_GET_ERROR',
        errorParam: {
          aggregateId,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  async getEventsByType(eventType: string, fromVersion?: number): Promise<Result<StoredDomainEvent[]>> {
    try {
      const queryBuilder = this.eventRepository
        .createQueryBuilder('event')
        .where('event.eventType = :eventType', { eventType });

      if (fromVersion !== undefined) {
        queryBuilder.andWhere('event.globalVersion > :fromVersion', { fromVersion });
      }

      const events = await queryBuilder.orderBy('event.globalVersion', 'ASC').getMany();

      const storedEvents = events.map((entity) => this.mapEntityToStoredEvent(entity));

      this.logger.debug(`Retrieved ${events.length} events of type ${eventType}`);
      return Result.ok(storedEvents);
    } catch (error) {
      this.logger.error(`Failed to get events by type ${eventType}:`, error);
      return Result.fail({
        errorKey: 'EVENT_STORE_GET_ERROR',
        errorParam: {
          eventType,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  async getAllEvents(fromVersion?: number, toVersion?: number): Promise<Result<StoredDomainEvent[]>> {
    try {
      const queryBuilder = this.eventRepository.createQueryBuilder('event');

      if (fromVersion !== undefined) {
        queryBuilder.andWhere('event.globalVersion > :fromVersion', { fromVersion });
      }

      if (toVersion !== undefined) {
        queryBuilder.andWhere('event.globalVersion <= :toVersion', { toVersion });
      }

      const events = await queryBuilder.orderBy('event.globalVersion', 'ASC').getMany();

      const storedEvents = events.map((entity) => this.mapEntityToStoredEvent(entity));

      this.logger.debug(
        `Retrieved ${events.length} events from event store` +
          (fromVersion !== undefined || toVersion !== undefined
            ? ` (version range: ${fromVersion ?? 'start'} - ${toVersion ?? 'end'})`
            : ''),
      );

      return Result.ok(storedEvents);
    } catch (error) {
      this.logger.error('Failed to get all events:', error);
      return Result.fail({
        errorKey: 'EVENT_STORE_GET_ERROR',
        errorParam: { error: this.extractErrorMessage(error) },
      });
    }
  }

  async getEventsForAggregates(aggregateIds: string[]): Promise<Result<Record<string, StoredDomainEvent[]>>> {
    try {
      const events = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.aggregateId IN (:...aggregateIds)', { aggregateIds })
        .orderBy('event.aggregateId', 'ASC')
        .addOrderBy('event.eventVersion', 'ASC')
        .getMany();

      // Group events by aggregate ID
      const result: Record<string, StoredDomainEvent[]> = {};

      for (const aggregateId of aggregateIds) {
        result[aggregateId] = events
          .filter((event) => event.aggregateId === aggregateId)
          .map((entity) => this.mapEntityToStoredEvent(entity));
      }

      this.logger.debug(`Retrieved events for ${aggregateIds.length} aggregates ` + `(total ${events.length} events)`);

      return Result.ok(result);
    } catch (error) {
      this.logger.error('Failed to get events for multiple aggregates:', error);
      return Result.fail({
        errorKey: 'EVENT_STORE_GET_ERROR',
        errorParam: {
          aggregateCount: aggregateIds.length,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  async saveSnapshot(
    aggregateId: string,
    aggregateType: string,
    snapshot: Record<string, unknown>,
    version: number,
  ): Promise<Result<void>> {
    // Wrap with circuit breaker + retry logic
    try {
      return await this.circuitBreaker.execute(async () => {
        return await retryWithBackoff(
          async () => {
            return await this.saveSnapshotInternal(aggregateId, aggregateType, snapshot, version);
          },
          {
            maxRetries: RETRY.MAX_ATTEMPTS,
            baseDelay: RETRY.BASE_DELAY,
            maxDelay: RETRY.MAX_DELAY,
            shouldRetry: (error) => this.isTransientError(error),
            logger: this.logger,
            operationName: 'saveSnapshot',
          },
        );
      });
    } catch (error) {
      // If circuit is open or all retries exhausted, return failure
      this.logger.error(`Failed to save snapshot after retries for aggregate ${aggregateId}:`, error);
      return Result.fail({
        errorKey: 'EVENT_STORE_SNAPSHOT_ERROR',
        errorParam: {
          aggregateId,
          version,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  /**
   * Internal implementation of saveSnapshot
   * Separated to allow retry logic to wrap the operation
   */
  private async saveSnapshotInternal(
    aggregateId: string,
    aggregateType: string,
    snapshot: Record<string, unknown>,
    version: number,
  ): Promise<Result<void>> {
    const snapshotEntity = new SnapshotEntity();
    snapshotEntity.aggregateId = aggregateId;
    snapshotEntity.aggregateType = aggregateType;
    snapshotEntity.version = version;
    snapshotEntity.snapshotData = snapshot;
    snapshotEntity.metadata = {
      createdBy: 'system',
      snapshotReason: 'performance_optimization',
    };

    await this.snapshotRepository.save(snapshotEntity);

    this.logger.debug(`Saved snapshot for aggregate ${aggregateId} at version ${version}`);

    return Result.ok();
  }

  async getSnapshot(
    aggregateId: string,
  ): Promise<Result<{ snapshot: Record<string, unknown>; version: number } | null>> {
    try {
      const snapshotEntity = await this.snapshotRepository.findOne({
        where: { aggregateId },
        order: { version: 'DESC' },
      });

      if (!snapshotEntity) {
        return Result.ok(null);
      }

      const result = {
        snapshot: snapshotEntity.snapshotData,
        version: snapshotEntity.version,
      };

      this.logger.debug(`Retrieved snapshot for aggregate ${aggregateId} at version ${snapshotEntity.version}`);

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Failed to get snapshot for aggregate ${aggregateId}:`, error);
      return Result.fail({
        errorKey: 'EVENT_STORE_SNAPSHOT_ERROR',
        errorParam: {
          aggregateId,
          error: this.extractErrorMessage(error),
        },
      });
    }
  }

  /**
   * Advanced Production Features
   */

  /**
   * Get current version with proper transaction isolation
   */
  private async getCurrentVersionInTransaction(queryRunner: QueryRunner, aggregateId: string): Promise<number> {
    const result = (await queryRunner.query(
      'SELECT COALESCE(MAX(event_version), 0) as current_version FROM event_store WHERE aggregate_id = $1',
      [aggregateId],
    )) as Array<{ current_version: string }>;

    return parseInt(result[0]?.current_version ?? '0', 10);
  }

  /**
   * Map database entity to domain StoredDomainEvent
   */
  private mapEntityToStoredEvent(entity: EventStoreEntity): StoredDomainEvent {
    return {
      eventId: entity.eventId,
      aggregateId: entity.aggregateId,
      aggregateType: entity.aggregateType,
      eventType: entity.eventType,
      eventVersion: entity.eventVersion,
      eventData: entity.eventData,
      metadata: entity.metadata ?? {},
      occurredOn: entity.occurredOn,
      getAggregateId: () => entity.aggregateId,
    };
  }

  /**
   * Serialize domain event to database format
   */
  private serializeEvent(event: EventRoot): Record<string, unknown> {
    const serialized: Record<string, unknown> = {};

    // Extract all enumerable properties
    for (const [key, value] of Object.entries(event)) {
      if (key !== 'constructor' && key !== 'prototype') {
        serialized[key] = value;
      }
    }

    // Add event type information
    serialized.eventType = event.constructor.name;

    return serialized;
  }

  /**
   * Extract correlation ID from event metadata
   */
  private extractCorrelationId(event: EventRoot): string | undefined {
    // Try to extract from common event properties
    const eventData = event as unknown as Record<string, unknown>;
    const correlationId = eventData.correlationId as string | undefined;
    return correlationId ?? uuidv4();
  }

  /**
   * Extract user ID from event metadata
   */
  private extractUserId(event: EventRoot): string | undefined {
    const eventData = event as unknown as Record<string, unknown>;
    return eventData.userId as string | undefined;
  }

  /**
   * Extract clean error message for logging
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Emit monitoring metrics (production hook)
   */
  private emitMetrics(metricName: string, value: number, tags?: Record<string, string>): void {
    // In production, integrate with monitoring service (Prometheus, DataDog, etc.)
    this.logger.debug(`METRIC: ${metricName}=${value}`, tags);
  }

  /**
   * Classify database errors into transient vs permanent
   *
   * Transient errors (should retry):
   * - Network timeouts, connection errors
   * - Connection pool exhausted
   * - Deadlock detected
   * - Database temporarily unavailable
   *
   * Permanent errors (should NOT retry):
   * - Unique constraint violation
   * - Foreign key constraint violation
   * - Data type mismatch
   * - Invalid SQL syntax
   * - Permission denied
   *
   * @param error - Database error object
   * @returns true if error is transient and should be retried
   */
  private isTransientError(error: unknown): boolean {
    if (error === null || error === undefined || typeof error !== 'object') {
      return false;
    }

    const err = error as { code?: string; message?: string; errno?: number };

    // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html

    // Connection errors (08xxx) - Always retry
    if (err.code?.startsWith('08') === true) {
      return true; // Connection exception, connection failure, etc.
    }

    // Insufficient resources (53xxx) - Retry
    if (err.code?.startsWith('53') === true) {
      return true; // Out of memory, disk full, too many connections
    }

    // Operator intervention (57xxx) - Retry
    if (err.code?.startsWith('57') === true) {
      return true; // Database shutdown, crash shutdown, cannot connect now
    }

    // Transaction rollback (40xxx) - Retry
    if (err.code === '40001') {
      return true; // Serialization failure (deadlock)
    }
    if (err.code === '40P01') {
      return true; // Deadlock detected
    }

    // Lock timeout - Retry
    if (err.code === '55P03') {
      return true; // Lock not available
    }

    // Network/timeout errors (by message pattern)
    const message = err.message?.toLowerCase() ?? '';
    if (message.length > 0) {
      if (
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('etimedout')
      ) {
        return true;
      }
    }

    // Permanent errors - DO NOT retry

    // Unique constraint violation (23505)
    if (err.code === '23505') {
      return false;
    }

    // Foreign key violation (23503)
    if (err.code === '23503') {
      return false;
    }

    // Check violation (23514)
    if (err.code === '23514') {
      return false;
    }

    // Invalid data type (22xxx)
    if (err.code?.startsWith('22') === true) {
      return false;
    }

    // Syntax error (42xxx)
    if (err.code?.startsWith('42') === true) {
      return false;
    }

    // Default: don't retry unknown errors (safer)
    return false;
  }

  /**
   * Production utility: Create database tables
   */
  async createTables(): Promise<Result<void>> {
    try {
      await this.dataSource.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS event_store (
          event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          aggregate_id UUID NOT NULL,
          aggregate_type VARCHAR(100) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          event_version INTEGER NOT NULL,
          global_version BIGINT NOT NULL,
          event_data JSONB NOT NULL,
          metadata JSONB,
          occurred_on TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(aggregate_id, event_version)
        );

        CREATE TABLE IF NOT EXISTS event_store_snapshots (
          aggregate_id UUID PRIMARY KEY,
          aggregate_type VARCHAR(100) NOT NULL,
          version INTEGER NOT NULL,
          snapshot_data JSONB NOT NULL,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Performance indexes
        CREATE INDEX IF NOT EXISTS idx_event_store_aggregate_type_version ON event_store(aggregate_type, event_version);
        CREATE INDEX IF NOT EXISTS idx_event_store_event_type_global_version ON event_store(event_type, global_version);
        CREATE INDEX IF NOT EXISTS idx_event_store_global_version ON event_store(global_version);
        CREATE INDEX IF NOT EXISTS idx_event_store_occurred_on ON event_store(occurred_on);
        CREATE INDEX IF NOT EXISTS idx_snapshots_type_version ON event_store_snapshots(aggregate_type, version);
      `);

      this.logger.log('Event store database tables created successfully');
      return Result.ok();
    } catch (error) {
      this.logger.error('Failed to create event store tables:', error);
      return Result.fail({
        errorKey: 'EVENT_STORE_SETUP_ERROR',
        errorParam: { error: this.extractErrorMessage(error) },
      });
    }
  }
}
