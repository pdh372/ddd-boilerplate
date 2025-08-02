export interface ITranslatorInput {
  key: string;
  param: Record<string, any>;
}

export interface ITranslatorInterpolateInput {
  [key: string]: string;
}

export type ITranslatorByLanguage = {
  [errorKey: string]: {
    [language: string]: string;
  };
};

export interface ITranslatorRepository {
  translate(input: ITranslatorInput): string;
  setLanguage(lang: string): void;
  get currentLanguage(): string;
}
