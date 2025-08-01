import type { LANGUAGE_VALUE } from '../constant';

export interface ITranslatorInput {
  key: string;
  lang: ConstValue<typeof LANGUAGE_VALUE>;
  param: Record<string, any>;
}

export interface ITranslatorInterpolateInput {
  [key: string]: string;
}

export type ITranslatorByLanguage = {
  [key in ConstValue<typeof LANGUAGE_VALUE>]: {
    [key: string]: string;
  };
};

export interface ITranslatorRepository {
  translate(input: ITranslatorInput): string;
  setLanguage(lang: ConstValue<typeof LANGUAGE_VALUE>): void;
  get language(): typeof LANGUAGE_VALUE;
}
