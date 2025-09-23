import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateOrderItemQuantityDto {
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @IsNumber()
  quantity!: number;
}

export class AddOrderItemDto {
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
