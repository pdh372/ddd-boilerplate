import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DomainEventService } from './service/domain-event.service';
import { TransactionService } from './service/transaction.service';
import { DOMAIN_EVENT_SERVICE, TRANSACTION_SERVICE } from '../shared.token';

/**
 * Shared Application Module
 * Provides cross-cutting application services globally
 */
@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: DOMAIN_EVENT_SERVICE,
      useClass: DomainEventService,
    },
    {
      provide: TRANSACTION_SERVICE,
      useClass: TransactionService,
    },
  ],
  exports: [DOMAIN_EVENT_SERVICE, TRANSACTION_SERVICE],
})
export class SharedAppModule {}
