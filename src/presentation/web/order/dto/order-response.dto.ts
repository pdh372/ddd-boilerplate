export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponseDto {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
