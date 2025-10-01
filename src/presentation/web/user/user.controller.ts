import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { GetUserWithCacheUseCase, CreateUserUseCase } from '@module/user/app/use-case';
import { AcceptLanguage, IAcceptLanguageContext } from '@shared/decorator';
import { CreateUserDto, UserResponseDto } from './dto';
import { ERROR_STATUS_CODE } from '@shared/translator';
import { UserMapper } from './mapper/user.mapper';

@Controller('user')
export class UserController {
  constructor(
    private readonly _createUserUseCase: CreateUserUseCase,
    private readonly _getUserUseCase: GetUserWithCacheUseCase,
  ) {}

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
    @AcceptLanguage() acceptLanguage: IAcceptLanguageContext,
  ): Promise<UserResponseDto> {
    const result = await this._createUserUseCase.execute(body);

    if (result.isFailure) {
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
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
      const statusCode = ERROR_STATUS_CODE[result.errorKey] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(acceptLanguage({ key: result.errorKey, param: result.errorParam }), statusCode);
    }

    const user = result.getValue;
    return UserMapper.toResponseDto(user);
  }
}
