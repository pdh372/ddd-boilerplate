import { IdVO } from '@shared/domain/vo';

interface UserIdProps {
  value: string;
}

export class UserId extends IdVO {
  constructor(props: UserIdProps) {
    super(props);
  }
}
