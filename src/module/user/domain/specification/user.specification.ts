import { Specification } from '@shared/domain/specification/base.specification';
import type { UserAggregate } from '../aggregate';

/**
 * Business rule: User must have valid email domain
 */
export class ValidEmailDomainSpecification extends Specification<UserAggregate> {
  private readonly allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'company.com'];

  isSatisfiedBy(user: UserAggregate): boolean {
    const emailValue = user.email.value.toLowerCase();
    const domain = emailValue.split('@')[1];
    return this.allowedDomains.includes(domain ?? '');
  }
}

/**
 * Business rule: User name must be professional
 */
export class ProfessionalNameSpecification extends Specification<UserAggregate> {
  private readonly forbiddenWords = ['admin', 'test', 'demo', 'user123'];

  isSatisfiedBy(user: UserAggregate): boolean {
    const nameValue = user.name.value.toLowerCase();
    return !this.forbiddenWords.some((word) => nameValue.includes(word));
  }
}

/**
 * Business rule: User account is active (not old)
 */
export class ActiveUserSpecification extends Specification<UserAggregate> {
  private readonly maxInactiveMonths = 12;

  isSatisfiedBy(user: UserAggregate): boolean {
    const now = new Date();
    const monthsInactive = (now.getTime() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsInactive <= this.maxInactiveMonths;
  }
}

/**
 * Composite specification: User is eligible for premium features
 */
export class PremiumEligibleUserSpecification extends Specification<UserAggregate> {
  private readonly validEmailSpec = new ValidEmailDomainSpecification();
  private readonly professionalNameSpec = new ProfessionalNameSpecification();
  private readonly activeUserSpec = new ActiveUserSpecification();

  isSatisfiedBy(user: UserAggregate): boolean {
    return this.validEmailSpec.and(this.professionalNameSpec).and(this.activeUserSpec).isSatisfiedBy(user);
  }
}
