import { Result } from '../domain/result';

export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<Result<IResponse>>;
}
