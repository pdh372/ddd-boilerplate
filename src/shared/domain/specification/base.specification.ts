import { ResultSpecification } from './result.specification';

/**
 * Abstract Specification Pattern
 * Encapsulates business rules and complex queries
 */
export abstract class Specification<T> {
  /**
   * Check if entity satisfies this specification
   */
  abstract isSatisfiedBy(entity: T): boolean;

  /**
   * Combine specifications with AND logic
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Combine specifications with OR logic
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Negate this specification
   */
  not(): Specification<T> {
    return new NotSpecification(this);
  }

  /**
   * Validate entity against specification and return Result
   */
  validate(entity: T): ResultSpecification<T> {
    if (this.isSatisfiedBy(entity)) {
      return ResultSpecification.ok(entity);
    }
    return ResultSpecification.fail({
      errorKey: 'SPECIFICATION_NOT_SATISFIED',
      errorParam: { specification: this.constructor.name },
    });
  }
}

/**
 * Composite Specification - AND
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }
}

/**
 * Composite Specification - OR
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }
}

/**
 * Composite Specification - NOT
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private readonly specification: Specification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.specification.isSatisfiedBy(entity);
  }
}
