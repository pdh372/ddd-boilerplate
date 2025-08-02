import { Controller, Post, Get, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserUseCase, GetUserUseCase } from '@module/user/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateUserDto } from './dto';

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
      const errorMessage = result.getError();
      throw new HttpException(
        acceptLanguage({ key: errorMessage.errorKey, param: errorMessage.errorParam }),
        HttpStatus.BAD_REQUEST,
      );
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
  async getUser(@Param('id') id: string) {
    const result = await this._getUserUseCase.execute({ userId: id });

    if (result.isFailure) {
      const errorMessage = result.getError();
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    const user = result.getValue;

    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
