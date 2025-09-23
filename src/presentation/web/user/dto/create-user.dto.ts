import type { ICreateUserDto } from '@module/user/app/dto';
import { IsString } from 'class-validator';

export class CreateUserDto implements ICreateUserDto {
  @IsString()
  email!: string;

  @IsString()
  name!: string;
}
