import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TranslatorService } from '@infra/translator/translator.service';
import { type ITranslatorInput } from '@module/translator/domain/repo/translator.repo';

export type IAcceptLanguageContext = (input: ITranslatorInput) => string;

export const AcceptLanguage = createParamDecorator((_data: unknown, ctx: ExecutionContext): IAcceptLanguageContext => {
  const request = ctx.switchToHttp().getRequest<IRequest>();
  const acceptLanguage = request.headers['accept-language'];

  const translator = new TranslatorService();
  translator.setLanguage(acceptLanguage);

  return (input: ITranslatorInput): string => translator.translate(input);
});
