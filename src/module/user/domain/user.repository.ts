import { User } from './user';
import { UserId } from './user-id';
import { UserEmail } from './user-email';

export interface UserRepository {
  save(entity: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  delete(id: string): Promise<void>;
  findByEmail(email: UserEmail): Promise<User | null>;
}
