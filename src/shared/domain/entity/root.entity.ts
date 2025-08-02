export abstract class EntityRoot<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public equals(object?: EntityRoot<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof EntityRoot)) {
      return false;
    }

    return this._id === object._id;
  }
}
