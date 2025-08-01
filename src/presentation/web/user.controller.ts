import { Controller, Post, Get, Body, Param, HttpStatus, HttpException, Headers, Inject } from '@nestjs/common';
import { ExecutionContextSpecification } from '@shared/domain/specification';
import { CreateUserUseCase } from '../../module/user/app/use-case/create-user.use-case';
import { GetUserUseCase } from '../../module/user/app/use-case/get-user.use-case';
import { CreateUserDto } from '../../module/user/app/dto';
import { ITranslatorRepository } from '@shared/domain/repo';
import { ILanguage } from '@shared/domain/constant';
import { TRANSLATOR_REPOSITORY } from '../../infra/translator/translator.token';

@Controller('users')
export class UserController {
  constructor(
    private readonly _createUserUseCase: CreateUserUseCase,
    private readonly _getUserUseCase: GetUserUseCase,
    @Inject(TRANSLATOR_REPOSITORY) private readonly _translator: ITranslatorRepository,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Headers('accept-language') acceptLanguage?: ILanguage) {
    const context = ExecutionContextSpecification.create({
      language: acceptLanguage,
    });

    const result = await this._createUserUseCase.execute({ req: createUserDto, ctx: context });

    if (result.isFailure) {
      const errorMessage = result.getError({ translator: this._translator, context });
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
  async getUser(@Param('id') id: string, @Headers('accept-language') acceptLanguage?: ILanguage) {
    const context = ExecutionContextSpecification.create({
      language: acceptLanguage,
    });

    const result = await this._getUserUseCase.execute({ req: { userId: id }, ctx: context });

    if (result.isFailure) {
      const errorMessage = result.getError({ translator: this._translator, context });
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
}
