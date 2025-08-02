import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { type ITranslatorInput, TranslatorService } from '@shared/translator/translator.service';

export type IAcceptLanguageContext = (input: ITranslatorInput) => string;

export const AcceptLanguage = createParamDecorator((_data: unknown, ctx: ExecutionContext): IAcceptLanguageContext => {
  const request = ctx.switchToHttp().getRequest<IRequest>();
  const acceptLanguage = request.headers['accept-language'];

  const translator = new TranslatorService();
  translator.setLanguage(acceptLanguage);

  return (input: ITranslatorInput): string => translator.translate(input);
});
