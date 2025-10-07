export interface IErrorSpecification {
  errorKey: string;
  errorParam?: Record<string, string | number | boolean>;
}

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value: T | undefined;
  private readonly _error: IErrorSpecification | undefined;

  constructor(isSuccess: boolean, error?: IErrorSpecification, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  public get getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Can not get value of an error result. Use getError() instead.');
    }

    return this._value as T;
  }

  public get errorKey(): string {
    if (this.isSuccess) {
      throw new Error('Can not get error of a successful result.');
    }

    return this._error?.errorKey ?? '';
  }

  public get errorParam(): Record<string, string | number | boolean> {
    if (this.isSuccess) {
      throw new Error('Can not get error param of a successful result.');
    }

    return this._error?.errorParam ?? {};
  }

  public get error(): IErrorSpecification {
    if (this.isSuccess) {
      throw new Error('Can not get error of a successful result.');
    }

    return this._error as IErrorSpecification;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(input: IErrorSpecification): Result<U> {
    return new Result<U>(false, input);
  }

  public static combine(results: Result<unknown>[]): Result<null> {
    for (const result of results) {
      if (result.isFailure) return result as Result<null>;
    }
    return Result.ok<null>();
  }
}
