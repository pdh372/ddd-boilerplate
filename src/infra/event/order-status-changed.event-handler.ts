import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderStatusChangedEvent } from '@module/order/domain/event';

/**
 * Handler for OrderStatusChangedEvent
 * Executes side effects when order status changes
 */
@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedEventHandler implements IEventHandler<OrderStatusChangedEvent> {
  private readonly logger = new Logger(OrderStatusChangedEventHandler.name);

  handle(event: OrderStatusChangedEvent): void {
    this.logger.log('📦 Order status changed:', {
      orderId: event.order.id.value,
      customerId: event.order.customerId.value,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      occurredOn: event.occurredOn,
    });

    // Here you could:
    // - Send notification to customer
    // - Update inventory
    // - Trigger shipping process
    // - Update analytics
    // - Send webhook notifications
    // - etc.
  }
}
