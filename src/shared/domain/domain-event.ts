export interface DomainEvent {
  occurredOn: Date;
  getAggregateId(): string;
}
