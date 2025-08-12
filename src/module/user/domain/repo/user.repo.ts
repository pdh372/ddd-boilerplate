import type { UserAggregate } from '../aggregate';
import type { UserEmail, UserId } from '../vo';

export interface IUserRepository {
  save(entity: UserAggregate): Promise<UserAggregate>;
  findById(id: UserId): Promise<UserAggregate | null>;
  delete(id: UserId): Promise<void>;
  findByEmail(email: UserEmail): Promise<UserAggregate | null>;
}
