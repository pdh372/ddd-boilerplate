import { IdVO } from '@shared/domain/vo';

interface OrderIdItemProps {
  value: string;
}

export class OrderIdItem extends IdVO {
  constructor(props: OrderIdItemProps) {
    super(props);
  }
}
