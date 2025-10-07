import { Injectable } from '@nestjs/common';
import { LANGUAGE_TYPE } from './translator.key';
import { TRANSLATOR_MESSAGE } from './translator.message';

export interface ITranslatorInput {
  key: string;
  param?: Record<string, string | number | boolean>;
}

export interface ITranslatorInterpolateInput {
  [key: string]: string | number | boolean;
}

@Injectable()
export class TranslatorHelper {
  private readonly _translation: { [key: string]: { [key: string]: string } } = TRANSLATOR_MESSAGE;
  private _currentLanguage: ConstValue<typeof LANGUAGE_TYPE> = LANGUAGE_TYPE.EN;

  constructor() {}

  get currentLanguage() {
    return this._currentLanguage;
  }

  setLanguage(lang: string = ''): void {
    if (!Object.values(LANGUAGE_TYPE).includes(lang as ConstValue<typeof LANGUAGE_TYPE>)) {
      this._currentLanguage = LANGUAGE_TYPE.EN;
      return;
    }

    this._currentLanguage = lang as ConstValue<typeof LANGUAGE_TYPE>;
  }

  translate(input: ITranslatorInput): string {
    const language = this._currentLanguage;

    const translationForKey = this._translation[input.key];
    if (translationForKey === undefined) {
      throw new Error(`Translation for key "${input.key}" not found`);
    }

    const translation = translationForKey[language];
    if (translation === undefined) {
      throw new Error(`Translation for key "${input.key}" not found in language "${language}"`);
    }

    if (input.param !== undefined) {
      return this.interpolate(translation, input.param);
    }

    return translation;
  }

  private interpolate(template: string, params: ITranslatorInterpolateInput): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = params[key];
      return value != null ? value.toString() : match;
    });
  }
}
