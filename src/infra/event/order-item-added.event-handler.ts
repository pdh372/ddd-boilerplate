import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderItemAddedEvent } from '@module/order/domain/event';

/**
 * Handler for OrderItemAddedEvent
 * Executes side effects when items are added to orders
 */
@EventsHandler(OrderItemAddedEvent)
export class OrderItemAddedEventHandler implements IEventHandler<OrderItemAddedEvent> {
  handle(event: OrderItemAddedEvent): void {
    console.log('🛍️ Item added to order:', {
      orderId: event.order.id.value,
      customerId: event.order.customerId.value,
      itemId: event.addedItem.id.value,
      productName: event.addedItem.productName.value,
      quantity: event.addedItem.quantity,
      unitPrice: event.addedItem.unitPrice,
      occurredOn: event.occurredOn,
    });

    // Here you could:
    // - Update inventory levels
    // - Trigger price recalculation
    // - Send recommendation updates
    // - Update analytics
    // - Check stock availability
    // - etc.
  }
}
