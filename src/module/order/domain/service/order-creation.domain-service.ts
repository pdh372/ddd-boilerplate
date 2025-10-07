import type { UserAggregate } from '@module/user/domain/aggregate';
import type { OrderAggregate } from '@module/order/domain/aggregate';
import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

/**
 * Domain Service for Order Creation
 * Handles business logic that spans multiple aggregates
 */
export interface IOrderCreationDomainService {
  /**
   * Creates order with cross-aggregate validation
   * @param user User creating the order
   * @param orderData Order creation data
   */
  createOrderForUser(
    user: UserAggregate,
    orderData: {
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
      }>;
    },
  ): Result<OrderAggregate>;

  /**
   * Validates if user can create orders
   * @param user User to validate
   */
  canUserCreateOrder(user: UserAggregate): Result<boolean>;
}

export class OrderCreationDomainService implements IOrderCreationDomainService {
  createOrderForUser(
    user: UserAggregate,
    orderData: {
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
      }>;
    },
  ): Result<OrderAggregate> {
    // 1. Validate user can create orders
    const canCreateResult = this.canUserCreateOrder(user);
    if (canCreateResult.isFailure) {
      return Result.fail(canCreateResult.error);
    }

    // 2. Business rule: User must be active
    const createdAt = user.createdAt;
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Account too new, minimum 1 day required' },
      });
    }

    // 3. Business rule: Validate order total
    const totalValue = orderData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    if (totalValue < 10) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__INVALID_QUANTITY,
        errorParam: { reason: 'Minimum order value not met', minimumValue: 10, currentValue: totalValue },
      });
    }

    // 4. Create the order aggregate - This would typically be done in the use case
    // Domain service focuses on cross-aggregate business rules
    // The actual order creation should be delegated to the use case layer
    return Result.ok({} as OrderAggregate); // Placeholder - implement in use case
  }

  canUserCreateOrder(user: UserAggregate): Result<boolean> {
    // Business rules for user order creation
    const now = new Date();
    const monthsSinceLastUpdate = (now.getTime() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

    // Rule: User must be recently active (updated within 12 months)
    if (monthsSinceLastUpdate > 12) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { reason: 'Account inactive', monthsInactive: Math.round(monthsSinceLastUpdate) },
      });
    }

    // Rule: User must have valid email domain
    const emailDomain = user.email.value.split('@')[1]?.toLowerCase();
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'company.com'];

    if (emailDomain == null || emailDomain === '' || !allowedDomains.includes(emailDomain)) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__INVALID_EMAIL,
        errorParam: { domain: emailDomain ?? 'unknown' },
      });
    }

    return Result.ok(true);
  }
}
