import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { IUserRepository, UserAggregate } from '@module/user/domain';
import type { UserEmail, UserId } from '@module/user/domain/vo';

// TypeORM Entity
import { Entity, Column, PrimaryColumn, Repository } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async save(entity: UserAggregate): Promise<UserAggregate> {
    const userEntity = new UserEntity();
    userEntity.id = entity.id.value;
    userEntity.email = entity.email.value;
    userEntity.name = entity.name.value;
    userEntity.createdAt = entity.createdAt;
    userEntity.updatedAt = entity.updatedAt;

    await this.userRepository.save(userEntity);
    return entity;
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: id.value },
    });

    if (!userEntity) {
      return null;
    }

    // Convert back to domain aggregate (you'll need a factory method)
    // This is simplified - you'd normally use a mapper
    return null; // TODO: Implement proper domain reconstruction
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }

  async findByEmail(email: UserEmail): Promise<UserAggregate | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email: email.value },
    });

    if (!userEntity) {
      return null;
    }

    // Convert back to domain aggregate
    return null; // TODO: Implement proper domain reconstruction
  }
}
