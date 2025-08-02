import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserTypeOrmRepository } from '../repo/typeorm/user.repo';
import { USER_REPOSITORY } from '@module/user/user.token';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // or your preferred database
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '') || 5432,
      username: process.env.DB_USERNAME || 'huypd',
      password: process.env.DB_PASSWORD || 'huypd',
      database: process.env.DB_NAME || 'huypd',
      entities: [UserEntity],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class TypeOrmDatabaseModule {}
