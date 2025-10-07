import type { OrderResponseDto } from './order-response.dto';

export interface ExportOrdersResponseDto {
  orders: OrderResponseDto[];
  total: number;
  exportedAt: Date;
  customerId: string;
}
