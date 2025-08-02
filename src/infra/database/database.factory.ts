import { Global, Module } from '@nestjs/common';
import { MongooseDatabaseModule } from './mongoose.config';

@Global()
@Module({
  imports: [MongooseDatabaseModule],
  exports: [MongooseDatabaseModule],
})
export class DatabaseInfra {}
