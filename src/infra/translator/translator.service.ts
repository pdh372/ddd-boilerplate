import { Injectable } from '@nestjs/common';
import {
  ITranslatorByLanguage,
  ITranslatorInput,
  ITranslatorInterpolateInput,
  ITranslatorRepository,
} from '../../module/translator/domain/repo/translator.repo';

@Injectable()
export class TranslatorService implements ITranslatorRepository {
  private readonly _LANGUAGE_TYPE = {
    VI: 'vi',
    EN: 'en',
  };

  private _translation: ITranslatorByLanguage = {};
  private _currentLanguage: string;

  constructor() {
    this._currentLanguage = this._LANGUAGE_TYPE.EN;
    this.loadTranslations();
  }

  get currentLanguage() {
    return this._currentLanguage;
  }

  setLanguage(lang: string = ''): void {
    if (!Object.values(this._LANGUAGE_TYPE).includes(lang)) {
      this._currentLanguage = this._LANGUAGE_TYPE.EN;
      return;
    }

    this._currentLanguage = lang;
  }

  translate(input: ITranslatorInput): string {
    const language = this._currentLanguage;
    const translation = this._translation[input.key][language];

    if (!translation) {
      throw new Error(`Translation for key "${input.key}" not found in language "${language}"`);
    }

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

  private loadTranslations(): void {
    this._translation = {
      'error.user.email_already_exists': {
        [this._LANGUAGE_TYPE.EN]: 'Email already exists',
        [this._LANGUAGE_TYPE.VI]: 'Email đã tồn tại',
      },
      'error.user.not_found': {
        [this._LANGUAGE_TYPE.EN]: 'User not found {{name}}',
        [this._LANGUAGE_TYPE.VI]: 'Không tìm thấy người dùng {{name}}',
      },
      'error.user.invalid_email': {
        [this._LANGUAGE_TYPE.EN]: 'Invalid email format',
        [this._LANGUAGE_TYPE.VI]: 'Định dạng email không hợp lệ',
      },
    };
  }
}
