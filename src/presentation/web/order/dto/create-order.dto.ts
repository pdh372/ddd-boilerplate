import { IsString, IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
