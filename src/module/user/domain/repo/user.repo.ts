import type { UserAggregate } from '../aggregate';
import type { UserEmail } from '../vo';
import type { IdVO } from '@shared/domain/vo';
import type { Result } from '@shared/domain/specification';

export interface IUserRepository {
  save(entity: UserAggregate): Promise<Result<UserAggregate>>;
  findById(id: IdVO): Promise<Result<UserAggregate | null>>;
  delete(id: IdVO): Promise<Result<void>>;
  findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>>;
}
