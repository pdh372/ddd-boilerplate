import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStoreEntity } from './entity/event-store.entity';
import { SnapshotEntity } from './entity/snapshot.entity';
import { InMemoryEventStore } from './in-memory-event-store';
import { PostgreSqlEventStore } from './postgresql-event-store';
import { EVENT_STORE } from '@shared/domain/event-store/event-store.interface';

/**
 * Event Store Infrastructure Module
 * Configures both in-memory (development) and PostgreSQL (production) event stores
 */
@Module({
  imports: [TypeOrmModule.forFeature([EventStoreEntity, SnapshotEntity])],
  providers: [
    InMemoryEventStore,
    PostgreSqlEventStore,
    {
      provide: EVENT_STORE,
      useFactory: (inMemoryStore: InMemoryEventStore, postgresStore: PostgreSqlEventStore) => {
        // Use PostgreSQL in production, in-memory for development/testing
        const usePostgres = process.env.NODE_ENV === 'production' || process.env.EVENT_STORE_TYPE === 'postgresql';

        return usePostgres ? postgresStore : inMemoryStore;
      },
      inject: [InMemoryEventStore, PostgreSqlEventStore],
    },
  ],
  exports: [EVENT_STORE, InMemoryEventStore, PostgreSqlEventStore],
})
export class EventStoreModule {}
