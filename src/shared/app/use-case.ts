import type { Result } from '@shared/domain/specification';

export interface UseCase<IRequest, IResponse> {
  execute(input: IRequest): Promise<Result<IResponse>>;
}
