import { Module } from '@nestjs/common';
import { TRANSLATOR_TOKEN, TranslatorService } from './translator.service';

@Module({
  providers: [{ useClass: TranslatorService, provide: TRANSLATOR_TOKEN }],
  exports: [TRANSLATOR_TOKEN],
})
export class TranslatorModule {}
