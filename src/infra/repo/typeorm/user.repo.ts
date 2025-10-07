import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserName } from '@module/user/domain/vo';

import { Entity, Column, Repository, PrimaryGeneratedColumn } from 'typeorm';
import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  createdAt!: Date;

  @Column()
  updatedAt!: Date;
}

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async save(entity: UserAggregate): Promise<ResultSpecification<UserAggregate>> {
    try {
      // Check if this is a new user (placeholder ID) or existing user
      if (entity.id.isPlaceholder()) {
        // New user - let TypeORM generate ID
        const userEntity = new UserEntity();
        userEntity.email = entity.email.value;
        userEntity.name = entity.name.value;
        userEntity.createdAt = entity.createdAt;
        userEntity.updatedAt = entity.updatedAt;

        const savedEntity = await this.userRepository.save(userEntity);
        return ResultSpecification.ok(this.toDomain(savedEntity));
      } else {
        // Existing user - update by ID
        const existingEntity = await this.userRepository.findOne({
          where: { id: entity.id.value },
        });

        if (!existingEntity) {
          return ResultSpecification.fail({
            errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
          });
        }

        existingEntity.email = entity.email.value;
        existingEntity.name = entity.name.value;
        existingEntity.updatedAt = new Date();

        const updatedEntity = await this.userRepository.save(existingEntity);
        return ResultSpecification.ok(this.toDomain(updatedEntity));
      }
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__CREATION_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findById(id: IdVO): Promise<ResultSpecification<UserAggregate | null>> {
    try {
      const userEntity = await this.userRepository.findOne({
        where: { id: id.value },
      });

      if (!userEntity) {
        return ResultSpecification.ok(null);
      }

      return ResultSpecification.ok(this.toDomain(userEntity));
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async delete(id: IdVO): Promise<ResultSpecification<void>> {
    try {
      await this.userRepository.delete({ id: id.value });
      return ResultSpecification.ok(undefined);
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findByEmail(email: UserEmail): Promise<ResultSpecification<UserAggregate | null>> {
    try {
      const userEntity = await this.userRepository.findOne({
        where: { email: email.value },
      });

      if (!userEntity) {
        return ResultSpecification.ok(null);
      }

      return ResultSpecification.ok(this.toDomain(userEntity));
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
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
