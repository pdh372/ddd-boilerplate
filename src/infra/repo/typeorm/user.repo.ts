import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserName } from '@module/user/domain/vo';

import { Entity, Column, Repository, PrimaryGeneratedColumn } from 'typeorm';
import { IdVO } from '@shared/domain/vo';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
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

    userEntity.email = entity.props.email.value;
    userEntity.name = entity.props.name.value;
    userEntity.createdAt = entity.props.createdAt;
    userEntity.updatedAt = entity.props.updatedAt;

    const savedEntity = await this.userRepository.save(userEntity);
    return this.toDomain(savedEntity);
  }

  async findById(id: IdVO): Promise<UserAggregate | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: id.value },
    });

    if (!userEntity) {
      return null;
    }

    return this.toDomain(userEntity);
  }

  async delete(id: IdVO): Promise<void> {
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
    const userId = IdVO.fromValue(userEntity.id);
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
