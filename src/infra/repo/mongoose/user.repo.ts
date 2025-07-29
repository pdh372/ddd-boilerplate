import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import type { IUserRepository, UserAggregate } from '@module/user/domain';
import type { UserEmail, UserId } from '@module/user/domain/vo';

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
      _id: entity.id.value,
      email: entity.email.value,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    await this.userModel.findByIdAndUpdate(entity.id.value, userDoc, { upsert: true, new: true });

    return entity;
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findById(id.value);

    if (!userDoc) {
      return null;
    }

    // Convert back to domain aggregate (you'll need a factory method)
    // This is simplified - you'd normally use a mapper
    return null; // TODO: Implement proper domain reconstruction
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async findByEmail(email: UserEmail): Promise<UserAggregate | null> {
    const userDoc = await this.userModel.findOne({ email: email.value });

    if (!userDoc) {
      return null;
    }

    // Convert back to domain aggregate
    return null; // TODO: Implement proper domain reconstruction
  }
}
