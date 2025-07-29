type LocalizedResultState = {
  isSuccess: boolean;
  isFailure: boolean;
  errorKey: string;
  errorParam: Record<string, any>;
};

export interface TranslatorInput {
  key: string;
  lang: ConstValue<typeof TRANSLATOR_LANGUAGE>;
  param: Record<string, any>;
}

export interface TranslatorDomain {
  translate(input: TranslatorInput): string;

  get language(): typeof TRANSLATOR_LANGUAGE;
}

export const TRANSLATOR_LANGUAGE = {
  VI: 'vi',
  EN: 'en',
} as const;

export interface TranslatorInterpolateInput {
  [key: string]: string;
}

export type TranslatorByLanguage = {
  [key in ConstValue<typeof TRANSLATOR_LANGUAGE>]: {
    [key: string]: string;
  };
};

type ExecutionContextState = {
  language: ConstValue<typeof TRANSLATOR_LANGUAGE>;
  userId?: string;
  requestId?: string;
};

export class LocalizedResult<T> {
  public _state: LocalizedResultState;
  private _value?: T;

  private constructor(input: LocalizedResultState, value?: T) {
    if (input.isSuccess && input.errorKey) {
      throw new Error('error.result.success_with_error');
    }
    if (!input.isSuccess && !input.errorKey) {
      throw new Error('error.result.failure_without_error');
    }

    this._state = input;
    this._value = value;

    Object.freeze(this);
  }

  public get errorKey(): string {
    return this._state.errorKey;
  }

  public get errorParam(): Record<string, any> {
    return this._state.errorParam;
  }

  public get isFailure(): boolean {
    return !!this._state.isFailure;
  }

  public get getValue(): T {
    if (!this._state.isSuccess) {
      throw new Error('error.result.cannot_get_value');
    }

    return this._value as T;
  }

  public getError(input: { translator: TranslatorDomain; context: ExecutionContext }): string {
    if (!this._state.errorKey) {
      return '';
    }

    return input.translator.translate({
      key: this._state.errorKey,
      param: this._state.errorParam,
      lang: input.context.language,
    });
  }

  public static ok<U>(value?: U): LocalizedResult<U> {
    return new LocalizedResult<U>({ isSuccess: true, isFailure: false, errorKey: '', errorParam: {} }, value);
  }

  public static fail<U>(input: { errorKey: string; errorParam?: Record<string, any> }): LocalizedResult<U> {
    return new LocalizedResult<U>({
      isSuccess: false,
      isFailure: true,
      errorKey: input.errorKey,
      errorParam: input.errorParam ?? {},
    });
  }
}

export class ExecutionContext {
  public readonly _state: ExecutionContextState;

  constructor(input: ExecutionContextState) {
    this._state = {
      ...input,
    };
  }

  static create({
    language = TRANSLATOR_LANGUAGE.EN,
    userId,
    requestId,
  }: {
    language?: ConstValue<typeof TRANSLATOR_LANGUAGE>;
    userId?: string;
    requestId?: string;
  }): ExecutionContext {
    return new ExecutionContext({ language, userId, requestId });
  }

  get language() {
    return this._state.language;
  }
}
