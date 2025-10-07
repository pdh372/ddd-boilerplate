import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DomainEventPublisher } from '@shared/domain/event';
import { UserCreatedEventHandler } from './user-created.event-handler';
import { OrderStatusChangedEventHandler } from './order-status-changed.event-handler';
import { OrderItemAddedEventHandler } from './order-item-added.event-handler';

const EventHandlers = [UserCreatedEventHandler, OrderStatusChangedEventHandler, OrderItemAddedEventHandler];

@Module({
  imports: [CqrsModule],
  providers: [DomainEventPublisher, ...EventHandlers],
  exports: [DomainEventPublisher],
})
export class EventInfraModule {}
