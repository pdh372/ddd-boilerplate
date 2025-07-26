import { Injectable } from '@nestjs/common';
import { User, UserId, UserEmail, UserRepository } from '../domain';
import { UserMapper, UserPersistence } from './user.mapper';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, UserPersistence> = new Map();
  private mapper = new UserMapper();

  async save(user: User): Promise<User> {
    const persistence = this.mapper.toPersistence(user);
    this.users.set(persistence.id, persistence);
    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    const persistence = this.users.get(id.value);
    if (!persistence) {
      return null;
    }
    return this.mapper.toDomain(persistence);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findByEmail(email: UserEmail): Promise<User | null> {
    for (const persistence of this.users.values()) {
      if (persistence.email === email.value) {
        return this.mapper.toDomain(persistence);
      }
    }
    return null;
  }
}
