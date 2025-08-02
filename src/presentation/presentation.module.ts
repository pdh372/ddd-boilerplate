import { Module } from '@nestjs/common';
import { UserModule } from './web/user/user.module';
import { DatabaseInfra } from '@infra/database/database.factory';

@Module({
  imports: [
    // Infra
    DatabaseInfra,

    // Modules
    UserModule,
  ],
})
export class AppModule {}
