export abstract class Mapper<T, U = Record<string, unknown>, V = Record<string, unknown>> {
  abstract toDomain(raw: U): T;
  abstract toPersistence(t: T): V;
}
