import { Specification } from '@shared/domain/specification/base.specification';
import type { UserAggregate } from '../aggregate';

/**
 * Concrete specification: User can create orders
 */
export class UserCanCreateOrderSpecification extends Specification<UserAggregate> {
  isSatisfiedBy(user: UserAggregate): boolean {
    // Business rules:
    // 1. Account must be at least 1 day old
    const daysSinceCreation = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) return false;

    // 2. Account must be recently active (within 12 months)
    const monthsSinceUpdate = (Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceUpdate > 12) return false;

    // 3. Must have valid email domain
    const emailDomain = user.email.value.split('@')[1]?.toLowerCase();
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'company.com'];
    if (emailDomain == null || emailDomain === '' || !allowedDomains.includes(emailDomain)) return false;

    return true;
  }
}

/**
 * Concrete specification: User has valid payment method (mock)
 */
export class UserHasValidPaymentMethodSpecification extends Specification<UserAggregate> {
  isSatisfiedBy(user: UserAggregate): boolean {
    // Mock business rule: Users with company emails are pre-approved
    const emailDomain = user.email.value.split('@')[1]?.toLowerCase();
    return emailDomain === 'company.com' || user.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Concrete specification: User is VIP customer
 */
export class UserIsVipCustomerSpecification extends Specification<UserAggregate> {
  isSatisfiedBy(user: UserAggregate): boolean {
    // Mock business rule: Users older than 30 days are VIP
    const daysOld = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 30;
  }
}
