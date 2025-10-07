import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserCreatedEvent } from '@module/user/domain/event';

/**
 * Handler for UserCreatedEvent
 * Executes side effects when a new user is created
 */
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  handle(event: UserCreatedEvent): void {
    this.logger.log('📧 New user created, sending welcome email:', {
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
