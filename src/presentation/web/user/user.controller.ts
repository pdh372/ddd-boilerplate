import { Controller, Post, Get, Body, Param, HttpException } from '@nestjs/common';
import { CreateUserUseCase, GetUserUseCase } from '@module/user/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateUserDto } from './dto';
import { ERROR_STATUS_CODE } from '@shared/translator';

@Controller('user')
export class UserController {
  constructor(
    private readonly _createUserUseCase: CreateUserUseCase,
    private readonly _getUserUseCase: GetUserUseCase,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserDto, @AcceptLanguage() acceptLanguage: IAcceptLanguageContext) {
    const result = await this._createUserUseCase.execute(body);

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const user = result.getValue;

    return {
      id: user.props.id.value,
      email: user.props.email.value,
      name: user.props.name.value,
      createdAt: user.props.createdAt,
      updatedAt: user.props.updatedAt,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @AcceptLanguage() acceptLanguage: IAcceptLanguageContext) {
    const result = await this._getUserUseCase.execute({ userId: id });

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const user = result.getValue;

    return {
      id: user.props.id.value,
      email: user.props.email.value,
      name: user.props.name.value,
      createdAt: user.props.createdAt,
      updatedAt: user.props.updatedAt,
    };
  }
}
