import {
  TRANSLATOR_LANGUAGE,
  TranslatorDomain,
  TranslatorInterpolateInput,
  TranslatorInput,
  TranslatorByLanguage,
} from '@shared/domain/specification';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslatorService implements TranslatorDomain {
  private translations: TranslatorByLanguage = {
    vi: {},
    en: {},
  };
  private defaultLanguage: ConstValue<typeof TRANSLATOR_LANGUAGE> = TRANSLATOR_LANGUAGE.EN;

  constructor() {
    this.loadTranslations();
  }

  get language() {
    return TRANSLATOR_LANGUAGE;
  }

  setLanguage(lang: ConstValue<typeof TRANSLATOR_LANGUAGE>): void {
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
      [TRANSLATOR_LANGUAGE.EN]: {},
      [TRANSLATOR_LANGUAGE.VI]: {},
    };
  }
}

export const TRANSLATOR_TOKEN = Symbol('TRANSLATOR_TOKEN');
