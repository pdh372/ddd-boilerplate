import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TRANSLATOR_REPOSITORY } from '@shared/domain/repository';

@Module({
  providers: [{ useClass: TranslatorService, provide: TRANSLATOR_REPOSITORY }],
  exports: [TRANSLATOR_REPOSITORY],
})
export class TranslatorModule {}
