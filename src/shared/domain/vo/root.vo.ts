export abstract class ValueObjectRoot<T> {
  protected readonly state: T;

  constructor(props: T) {
    this.state = Object.freeze(props);
  }

  public equals(vo?: ValueObjectRoot<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.state === undefined) {
      return false;
    }

    return JSON.stringify(this.state) === JSON.stringify(vo.state);
  }
}
