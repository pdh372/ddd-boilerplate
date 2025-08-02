import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserId } from '@module/user/domain/vo';
import { UserName } from '../../../module/user/domain';

@Schema({ collection: 'users' })
export class UserDocument extends Document {
  declare _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

@Injectable()
export class UserMongooseRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(entity: UserAggregate): Promise<UserAggregate> {
    const userDoc = {
      email: entity.email.value,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    await this.userModel.create(userDoc);

    return entity;
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findById(id.value);

    if (!userDoc) {
      return null;
    }

    return this.toDomain(userDoc);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async findByEmail(email: UserEmail): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findOne({ email: email.value });

    if (!userDoc) {
      return null;
    }

    return this.toDomain(userDoc);
  }

  private toDomain(userDoc: UserDocument): UserAggregate {
    const userId = UserId.fromValue(userDoc._id.toString());
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
