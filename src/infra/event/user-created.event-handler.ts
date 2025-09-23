import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '@module/user/domain/event';

/**
 * Handler for UserCreatedEvent
 * Executes side effects when a new user is created
 */
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  handle(event: UserCreatedEvent): void {
    console.log('📧 New user created, sending welcome email:', {
      userId: event.user.id.value,
      email: event.user.email.value,
      name: event.user.name.value,
      occurredOn: event.occurredOn,
    });

    // Here you could:
    // - Send welcome email
    // - Create user profile
    // - Log user registration
    // - Trigger analytics events
    // - etc.
  }
}
