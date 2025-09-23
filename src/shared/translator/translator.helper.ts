import { Injectable } from '@nestjs/common';
import { LANGUAGE_TYPE } from './translator.key';
import { TRANSLATOR_MESSAGE } from './translator.message';

export interface ITranslatorInput {
  key: string;
  param?: Record<string, string>;
}

export interface ITranslatorInterpolateInput {
  [key: string]: string;
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

    if (!this._translation[input.key]?.[language]) {
      throw new Error(`Translation for key "${input.key}" not found in language "${language}"`);
    }

    const translation = this._translation[input.key][language];

    if (input.param) {
      return this.interpolate(translation, input.param);
    }

    return translation;
  }

  private interpolate(template: string, params: ITranslatorInterpolateInput): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      return params[key]?.toString() || match;
    });
  }
}
