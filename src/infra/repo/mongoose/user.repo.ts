import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IUserRepository, UserAggregate } from '@module/user/domain';
import { UserEmail, UserName } from '@module/user/domain/vo';
import { IdVO } from '@shared/domain/vo';

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

  async save(userAggregate: UserAggregate): Promise<UserAggregate> {
    // Check if this is a new user (placeholder ID) or existing user
    if (userAggregate.props.id.value === 'PENDING_DB_GENERATION') {
      // New user - let MongoDB generate ID
      const userDoc = {
        email: userAggregate.props.email.value,
        name: userAggregate.props.name.value,
        createdAt: userAggregate.props.createdAt,
        updatedAt: userAggregate.props.updatedAt,
      };

      const newDoc = await this.userModel.create(userDoc);
      return this.toDomain(newDoc);
    } else {
      // Existing user - update
      const updatedDoc = await this.userModel.findByIdAndUpdate(
        userAggregate.props.id.value,
        {
          email: userAggregate.props.email.value,
          name: userAggregate.props.name.value,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedDoc) {
        throw new Error('User not found for update');
      }

      return this.toDomain(updatedDoc);
    }
  }

  async findById(id: IdVO): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findById(id.value);

    if (!userDoc) {
      return null;
    }

    return this.toDomain(userDoc);
  }

  async delete(id: IdVO): Promise<void> {
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
