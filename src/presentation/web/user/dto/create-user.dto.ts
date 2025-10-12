import type { ICreateUserDto } from '@module/user/app/dto';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimAndLowercase, trimString } from '@shared/decorator';

/**
 * CreateUser DTO with input sanitization
 * Note: Basic validation only - business rules validated in domain layer (VOs) with i18n support
 */
export class CreateUserDto implements ICreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => trimAndLowercase(value))
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => trimString(value))
  name!: string;
}
