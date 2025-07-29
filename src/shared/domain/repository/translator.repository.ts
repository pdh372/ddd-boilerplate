import type { LANGUAGE_VALUE } from '../constant';

export interface TranslatorInput {
  key: string;
  lang: ConstValue<typeof LANGUAGE_VALUE>;
  param: Record<string, any>;
}

export interface TranslatorInterpolateInput {
  [key: string]: string;
}

export type TranslatorByLanguage = {
  [key in ConstValue<typeof LANGUAGE_VALUE>]: {
    [key: string]: string;
  };
};

export interface TranslatorRepository {
  translate(input: TranslatorInput): string;
  setLanguage(lang: ConstValue<typeof LANGUAGE_VALUE>): void;
  get language(): typeof LANGUAGE_VALUE;
}

export const TRANSLATOR_REPOSITORY = Symbol('TRANSLATOR_TOKEN');
