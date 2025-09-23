import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderStatusChangedEvent } from '@module/order/domain/event';

/**
 * Handler for OrderStatusChangedEvent
 * Executes side effects when order status changes
 */
@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedEventHandler implements IEventHandler<OrderStatusChangedEvent> {
  handle(event: OrderStatusChangedEvent): void {
    console.log('📦 Order status changed:', {
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
