import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { trimString } from '@shared/decorator';

/**
 * CreateOrder DTOs with input sanitization
 * Note: Basic validation only - business rules validated in domain layer with i18n support
 */
export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimString(value))
  productId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }) => trimString(value))
  productName!: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimString(value))
  customerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
