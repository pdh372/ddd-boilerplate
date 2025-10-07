import type { ResultSpecification } from '@shared/domain/specification';

export interface UseCase<IRequest, IResponse> {
  execute(input: IRequest): Promise<ResultSpecification<IResponse>>;
}
