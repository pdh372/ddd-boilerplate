import { Module } from '@nestjs/common';
import { UserModule } from './module/user';

@Module({
  imports: [UserModule],
  providers: [],
})
export class AppModule {}
