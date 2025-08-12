import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserId, UserName } from '@module/user/domain/vo';

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
    userEntity.id = entity.props.id.value;
    userEntity.email = entity.props.email.value;
    userEntity.name = entity.props.name.value;
    userEntity.createdAt = entity.props.createdAt;
    userEntity.updatedAt = entity.props.updatedAt;

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

    return this.toDomain(userEntity);
  }

  async delete(id: UserId): Promise<void> {
    await this.userRepository.delete({ id: id.value });
  }

  async findByEmail(email: UserEmail): Promise<UserAggregate | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email: email.value },
    });

    if (!userEntity) {
      return null;
    }

    return this.toDomain(userEntity);
  }

  private toDomain(userEntity: UserEntity): UserAggregate {
    const userId = UserId.fromValue(userEntity.id);
    const userEmail = UserEmail.fromValue(userEntity.email);
    const userName = UserName.fromValue(userEntity.name);

    const user = UserAggregate.fromValue({
      id: userId,
      email: userEmail,
      name: userName,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    });

    return user;
  }
}
