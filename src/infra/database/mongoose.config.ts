import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema, UserMongooseRepository } from '../repo/mongoose/user.repo';
import { USER_REPOSITORY } from '@module/user/user.token';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddd_app', {}),
    MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserMongooseRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class MongooseDatabaseModule {}
