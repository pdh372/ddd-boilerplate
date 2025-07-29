import { LocalizedResult } from '@shared/domain';

export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<LocalizedResult<IResponse>>;
}
