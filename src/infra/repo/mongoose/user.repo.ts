import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserName } from '@module/user/domain/vo';
import { IdVO } from '@shared/domain/vo';
import { DomainEventPublisher } from '@shared/domain/event';
import { Result } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

@Schema({ collection: 'users' })
export class UserDocument extends Document {
  declare _id: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

@Injectable()
export class UserMongooseRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async save(userAggregate: UserAggregate): Promise<Result<UserAggregate>> {
    try {
      // Check if this is a new user (placeholder ID) or existing user
      if (userAggregate.id.value === 'PENDING_DB_GENERATION') {
        // New user - let MongoDB generate ID
        const userDoc = {
          email: userAggregate.email.value,
          name: userAggregate.name.value,
          createdAt: userAggregate.createdAt,
          updatedAt: userAggregate.updatedAt,
        };

        const newDoc = await this.userModel.create(userDoc);
        const savedUser = this.toDomain(newDoc);

        // Publish domain events
        this.eventPublisher.publishEventsForAggregate(userAggregate);

        return Result.ok(savedUser);
      } else {
        // Existing user - update
        const updatedDoc = await this.userModel.findByIdAndUpdate(
          userAggregate.id.value,
          {
            email: userAggregate.email.value,
            name: userAggregate.name.value,
            updatedAt: new Date(),
          },
          { new: true },
        );

        if (!updatedDoc) {
          return Result.fail({
            errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
          });
        }

        return Result.ok(this.toDomain(updatedDoc));
      }
    } catch (error) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__CREATION_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findById(id: IdVO): Promise<Result<UserAggregate | null>> {
    try {
      const userDoc = await this.userModel.findById(id.value);

      if (!userDoc) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(userDoc));
    } catch (error) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async delete(id: IdVO): Promise<Result<void>> {
    try {
      await this.userModel.findByIdAndDelete(id);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findByEmail(email: UserEmail): Promise<Result<UserAggregate | null>> {
    try {
      const userDoc = await this.userModel.findOne({ email: email.value });

      if (!userDoc) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(userDoc));
    } catch (error) {
      return Result.fail({
        errorKey: TRANSLATOR_KEY.ERROR__USER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private toDomain(userDoc: UserDocument): UserAggregate {
    const userId = IdVO.fromValue(userDoc._id.toString());
    const userEmail = UserEmail.fromValue(userDoc.email);
    const userName = UserName.fromValue(userDoc.name);

    const user = UserAggregate.fromValue({
      id: userId,
      email: userEmail,
      name: userName,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });

    return user;
  }
}
