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
    const userDoc = {
      email: userAggregate.props.email.value,
      name: userAggregate.props.name.value,
      createdAt: userAggregate.props.createdAt,
      updatedAt: userAggregate.props.updatedAt,
    };

    const newDoc = await this.userModel.create(userDoc);

    return this.toDomain(newDoc);
  }

  async findById(id: IdVO): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findById(id);

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
