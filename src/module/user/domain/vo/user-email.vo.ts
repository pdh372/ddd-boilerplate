import { ValueObjectRoot } from '@shared/domain/vo/root.vo';
import { LocalizedResult } from '@shared/domain/specification/translator.specification';

interface UserEmailState {
  value: string;
}

export class UserEmail extends ValueObjectRoot<UserEmailState> {
  get value(): string {
    return this.state.value;
  }

  private constructor(state: UserEmailState) {
    super(state);
  }

  public static create(email: string): LocalizedResult<UserEmail> {
    if (!this.isValidEmail(email)) {
      return LocalizedResult.fail<UserEmail>({ errorKey: 'error.user.invalid_email' });
    }

    return LocalizedResult.ok<UserEmail>(new UserEmail({ value: email }));
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
