import { Injectable } from '@nestjs/common';
import { LANGUAGE_VALUE } from '@shared/domain/constant';
import {
  TranslatorRepository,
  TranslatorInterpolateInput,
  TranslatorInput,
  TranslatorByLanguage,
} from '@shared/domain/repository';

@Injectable()
export class TranslatorService implements TranslatorRepository {
  private translations: TranslatorByLanguage = {
    vi: {},
    en: {},
  };
  private defaultLanguage: ConstValue<typeof LANGUAGE_VALUE> = LANGUAGE_VALUE.EN;

  constructor() {
    this.loadTranslations();
  }

  get language() {
    return LANGUAGE_VALUE;
  }

  setLanguage(lang: ConstValue<typeof LANGUAGE_VALUE>): void {
    this.defaultLanguage = lang;
  }

  translate(input: TranslatorInput): string {
    const language = input.lang || this.defaultLanguage;

    const translation = this.translations[language][input.key];

    if (input.param) {
      return this.interpolate(translation, input.param);
    }

    return translation;
  }

  private interpolate(template: string, params: TranslatorInterpolateInput): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      return params[key]?.toString() || match;
    });
  }

  private loadTranslations(): void {
    this.translations = {
      [LANGUAGE_VALUE.EN]: {},
      [LANGUAGE_VALUE.VI]: {},
    };
  }
}
