import { User } from '../aggregate';
import { UserId } from '../vo';
import { UserEmail } from '../vo';

export interface UserRepository {
  save(entity: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  delete(id: string): Promise<void>;
  findByEmail(email: UserEmail): Promise<User | null>;
}
