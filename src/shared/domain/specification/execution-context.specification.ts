import { type ILanguage, LANGUAGE_VALUE } from '../constant';

type ExecutionContextState = {
  language: ConstValue<typeof LANGUAGE_VALUE>;
  userId?: string;
  requestId?: string;
};

export class ExecutionContextSpecification {
  public readonly _state: ExecutionContextState;

  constructor(input: ExecutionContextState) {
    this._state = {
      ...input,
    };
  }

  static create({
    language = LANGUAGE_VALUE.EN,
    userId,
    requestId,
  }: {
    language?: ConstValue<typeof LANGUAGE_VALUE>;
    userId?: string;
    requestId?: string;
  }): ExecutionContextSpecification {
    return new ExecutionContextSpecification({ language: this.parseLanguage(language), userId, requestId });
  }

  get language() {
    return this._state.language;
  }

  private static parseLanguage(acceptLanguage?: string): ILanguage {
    if (!acceptLanguage) return LANGUAGE_VALUE.EN;

    const lang = Object.values(LANGUAGE_VALUE).find((validLanguage) => validLanguage === acceptLanguage);

    return lang ?? LANGUAGE_VALUE.EN;
  }
}
