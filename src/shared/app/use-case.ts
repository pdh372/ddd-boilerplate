import type { ExecutionContextSpecification, ResultSpecification } from '@shared/domain/specification';

export interface UseCase<IRequest, IResponse> {
  execute(input: { req: IRequest; ctx: ExecutionContextSpecification }): Promise<ResultSpecification<IResponse>>;
}
