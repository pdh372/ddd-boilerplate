import type { TranslatorRepository } from '../repo/translator.repository';
import type { ExecutionContextSpecification } from './execution-context.specification';

type ResultState = {
  isSuccess: boolean;
  isFailure: boolean;
  errorKey: string;
  errorParam: Record<string, any>;
};

export class ResultSpecification<T> {
  public _state: ResultState;
  private _value?: T;

  private constructor(input: ResultState, value?: T) {
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

  public getError(input: { translator: TranslatorRepository; context: ExecutionContextSpecification }): string {
    if (!this._state.errorKey) {
      return '';
    }

    return input.translator.translate({
      key: this._state.errorKey,
      param: this._state.errorParam,
      lang: input.context.language,
    });
  }

  public static ok<U>(value?: U): ResultSpecification<U> {
    return new ResultSpecification<U>({ isSuccess: true, isFailure: false, errorKey: '', errorParam: {} }, value);
  }

  public static fail<U>(input: { errorKey: string; errorParam?: Record<string, any> }): ResultSpecification<U> {
    return new ResultSpecification<U>({
      isSuccess: false,
      isFailure: true,
      errorKey: input.errorKey,
      errorParam: input.errorParam ?? {},
    });
  }
}
