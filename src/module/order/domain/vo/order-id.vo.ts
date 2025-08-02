import { IdVO } from '@shared/domain/vo';

interface OrderIdProps {
  value: string;
}

export class OrderId extends IdVO {
  constructor(props: OrderIdProps) {
    super(props);
  }
}
