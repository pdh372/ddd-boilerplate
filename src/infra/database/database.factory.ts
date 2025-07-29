import { Module } from '@nestjs/common';
import { TypeOrmDatabaseModule } from './typeorm.config';
import { MongooseDatabaseModule } from './mongoose.config';

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'mongoose';

@Module({
  imports: [DATABASE_TYPE === 'mongoose' ? MongooseDatabaseModule : TypeOrmDatabaseModule],
  exports: [DATABASE_TYPE === 'mongoose' ? MongooseDatabaseModule : TypeOrmDatabaseModule],
})
export class DatabaseInfra {}
