type ExecutionContextState = {
  language?: string;
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
    language,
    userId,
    requestId,
  }: {
    language?: string;
    userId?: string;
    requestId?: string;
  }): ExecutionContextSpecification {
    return new ExecutionContextSpecification({ language, userId, requestId });
  }

  get language() {
    return this._state.language;
  }
}
