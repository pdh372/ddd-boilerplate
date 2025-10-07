import type { UserAggregate } from '../aggregate';
import type { UserEmail } from '../vo';
import type { IdVO } from '@shared/domain/vo';
import type { ResultSpecification } from '@shared/domain/specification';

export interface IUserRepository {
  save(entity: UserAggregate): Promise<ResultSpecification<UserAggregate>>;
  findById(id: IdVO): Promise<ResultSpecification<UserAggregate | null>>;
  delete(id: IdVO): Promise<ResultSpecification<void>>;
  findByEmail(email: UserEmail): Promise<ResultSpecification<UserAggregate | null>>;
}
