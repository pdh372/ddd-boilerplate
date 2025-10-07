export interface EventRoot {
  occurredOn: Date;
  getAggregateId(): string;
}
