import { Entity, PrimaryColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * PostgreSQL Entity for Aggregate Snapshots
 * Optimizes event replay performance for large aggregates
 */
@Entity('event_store_snapshots')
@Index(['aggregateType', 'version'])
export class SnapshotEntity {
  @PrimaryColumn({ type: 'uuid' })
  aggregateId!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  aggregateType!: string;

  @Column({ type: 'integer' })
  @Index()
  version!: number;

  @Column({ type: 'jsonb' })
  snapshotData!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
