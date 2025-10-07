export interface ICreateOrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ICreateOrderDto {
  customerId: string;
  items: ICreateOrderItemDto[];
}