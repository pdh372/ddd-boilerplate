interface Equatable {
  equals(other: unknown): boolean;
}

export abstract class EntityRoot<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public equals(object?: EntityRoot<T>): boolean {
    if (object == null) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof EntityRoot)) {
      return false;
    }

    if (this._id != null && typeof this._id === 'object' && 'equals' in this._id) {
      return (this._id as unknown as Equatable).equals(object._id);
    }

    return this._id === object._id;
  }
}
