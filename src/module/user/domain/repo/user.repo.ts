import type { UserAggregate } from '../aggregate';
import type { UserEmail } from '../vo';
import type { IdVO } from '@shared/domain/vo';

export interface IUserRepository {
  save(entity: UserAggregate): Promise<UserAggregate>;
  findById(id: IdVO): Promise<UserAggregate | null>;
  delete(id: IdVO): Promise<void>;
  findByEmail(email: UserEmail): Promise<UserAggregate | null>;
}
