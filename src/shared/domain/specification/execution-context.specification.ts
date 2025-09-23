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
    const state: ExecutionContextState = {};
    if (language !== undefined) state.language = language;
    if (userId !== undefined) state.userId = userId;
    if (requestId !== undefined) state.requestId = requestId;
    return new ExecutionContextSpecification(state);
  }

  get language() {
    return this._state.language;
  }
}
