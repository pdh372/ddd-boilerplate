import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TRANSLATOR_REPOSITORY } from '@shared/domain/repo';

@Module({
  providers: [{ useClass: TranslatorService, provide: TRANSLATOR_REPOSITORY }],
  exports: [TRANSLATOR_REPOSITORY],
})
export class TranslatorModule {}
