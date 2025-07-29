import { Controller, Post, Get, Body, Param, HttpStatus, HttpException, Headers, Inject } from '@nestjs/common';
import { TranslatorDomain, ExecutionContext } from '@shared/domain';
import { CreateUserUseCase, GetUserUseCase } from './app/use-case';
import { CreateUserDto } from './app/dto';
import { TRANSLATOR_TOKEN } from '@shared/infra/translator';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    @Inject(TRANSLATOR_TOKEN) private readonly _translatorService: TranslatorDomain,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Headers('accept-language') acceptLanguage?: string) {
    const context = ExecutionContext.create({
      language: this.parseLanguage(acceptLanguage),
    });

    const result = await this.createUserUseCase.execute(createUserDto, context);

    if (result.isFailure) {
      const errorMessage = result.getError({ translator: this._translatorService, context });
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const user = result.getValue;
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Headers('accept-language') acceptLanguage?: string) {
    const context = ExecutionContext.create({
      language: this.parseLanguage(acceptLanguage),
    });

    const result = await this.getUserUseCase.execute({ userId: id }, context);

    if (result.isFailure) {
      const errorMessage = result.getError({ translator: this._translatorService, context });
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    const user = result.getValue;
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private parseLanguage(acceptLanguage?: string): 'en' | 'vi' {
    if (!acceptLanguage) return 'en';

    const languages = acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim());

    for (const lang of languages) {
      if (lang.startsWith('vi')) return 'vi';
      if (lang.startsWith('en')) return 'en';
    }

    return 'en';
  }
}
