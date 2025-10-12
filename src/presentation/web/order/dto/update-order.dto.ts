import { IsString, IsNumber, IsNotEmpty, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '@shared/decorator';

/**
 * UpdateOrder DTOs with input sanitization
 * Note: Basic validation only - business rules validated in domain layer with i18n support
 */
export class UpdateOrderItemQuantityDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimString(value))
  itemId!: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity!: number;
}

export class AddOrderItemDto {
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
