import { Controller, Post, Get, Body, Param, HttpException } from '@nestjs/common';
import { CreateUserUseCase, GetUserUseCase } from '@module/user/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateUserDto, UserResponseDto } from './dto';
import { ERROR_STATUS_CODE } from '@shared/translator';
import { UserMapper } from './mapper/user.mapper';

@Controller('user')
export class UserController {
  constructor(
    private readonly _createUserUseCase: CreateUserUseCase,
    private readonly _getUserUseCase: GetUserUseCase,
  ) {}

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<UserResponseDto> {
    const result = await this._createUserUseCase.execute(body);

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const user = result.getValue;
    return UserMapper.toResponseDto(user);
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<UserResponseDto> {
    const result = await this._getUserUseCase.execute({ userId: id });

    if (result.isFailure) {
      throw new HttpException(
        acceptLanguage({ key: result.errorKey, param: result.errorParam }),
        ERROR_STATUS_CODE[result.errorKey],
      );
    }

    const user = result.getValue;
    return UserMapper.toResponseDto(user);
  }
}
