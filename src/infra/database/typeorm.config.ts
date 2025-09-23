import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserTypeOrmRepository } from '../repo/typeorm/user.repo';
import { USER_REPOSITORY } from '@module/user/user.token';
import { ConfigService } from '@shared/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.database.postgres.host,
        port: configService.database.postgres.port,
        username: configService.database.postgres.username,
        password: configService.database.postgres.password,
        database: configService.database.postgres.database,
        entities: [UserEntity],
        synchronize: !configService.isProduction,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    ConfigService,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class TypeOrmDatabaseModule {}
