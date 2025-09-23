import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

/**
 * PostgreSQL Entity for Event Store
 * Optimized for high-performance event sourcing with proper indexing
 */
@Entity('event_store')
@Index(['aggregateId', 'eventVersion'], { unique: true })
@Index(['aggregateType', 'eventVersion'])
@Index(['eventType', 'globalVersion'])
@Index(['globalVersion'])
export class EventStoreEntity {
  @PrimaryGeneratedColumn('uuid')
  eventId!: string;

  @Column({ type: 'uuid' })
  @Index()
  aggregateId!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  aggregateType!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  eventType!: string;

  @Column({ type: 'integer' })
  eventVersion!: number;

  @Column({ type: 'bigint' })
  @Index()
  globalVersion!: number;

  @Column({ type: 'jsonb' })
  eventData!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index()
  occurredOn!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
