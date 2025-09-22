# AI Coding Agent Instructions for DDD Boilerplate

## Architecture Overview

This is a **Domain-Driven Design (DDD) NestJS application** with strict separation of concerns:

- **Domain Layer**: Aggregates, entities, value objects (VOs), domain events, repository interfaces
- **Application Layer**: Use cases, DTOs, orchestration logic
- **Infrastructure Layer**: Database implementations (TypeORM/Mongoose), external services
- **Presentation Layer**: Controllers, NestJS modules, HTTP handling

## Key Patterns & Conventions

### Module Structure

Each bounded context (e.g., `user`, `order`) follows:

```
src/module/{context}/
├── domain/
│   ├── aggregate/
│   ├── entity/
│   ├── vo/
│   ├── event/
│   └── repo/
├── app/
│   ├── use-case/
│   └── dto/
├── {context}.token.ts
```

**Note**: NestJS modules are currently in `presentation/web/{context}/` but should ideally be at module root for better organization.

### DDD Implementation

**Aggregate Factories**:

- `create()` for new aggregates (with domain events)
- `fromValue()` for reconstructing from database (no events)

**Value Objects (VOs)**:

- Use `validate(input)` for external input (with comprehensive validation)
- Use `fromValue(trusted)` for trusted values (DB reconstruction)
- Implement `equals(other)` for value-based equality
- Make VOs immutable (`readonly` props, freeze objects)
- For email validation, use `validator.js`'s `isEmail()` and `normalizeEmail()` for robust, RFC-compliant checks

### Critical DDD Patterns

**Aggregate Factories**: Use static methods for creation

- `create()` - For new aggregates with domain events, returns `ResultSpecification<Aggregate>`
- `fromValue()` - For reconstructing from database without events
- Example: `UserAggregate.create({ email, name })` vs `UserAggregate.fromValue(dbState)`

**Result Pattern**: All operations return `ResultSpecification<T>` for error handling:

```typescript
if (result.isFailure) {
  return ResultSpecification.fail({ errorKey: 'ERROR_KEY', errorParam: {...} });
}
return ResultSpecification.ok(value);
```

### Repository Pattern

- Domain interfaces in `src/module/{context}/domain/repo/`
- Infrastructure implementations in `src/infra/repo/{typeorm|mongoose}/`
- Always inject interface, not implementation
- Mappers convert between domain aggregates and database entities

### Use Case Pattern

All business logic flows through use cases implementing `UseCase<IRequest, IResponse>`: const result = await useCase.execute(input); if (result.isFailure) { return ResultSpecification.fail({ errorKey: 'ERROR_KEY', errorParam: {...} }); } return ResultSpecification.ok(result.getValue);

```typescript
export class CreateUserUseCase implements UseCase<ICreateUserDto, UserAggregate> {
  async execute(input: ICreateUserDto): Promise<ResultSpecification<UserAggregate>> {
    // Validate inputs using VO.validate()
    // Check business rules
    // Save via repository
    // Return ResultSpecification
  }
}
```

```

## Path Aliases (tsconfig.json)

- `@shared/*` → `src/shared/*`
- `@module/*` → `src/module/*`
- `@presentation/*` → `src/presentation/*`
- `@infra/*` → `src/infra/*`

## Development Workflows

**Build & Run**:

- `pnpm start:dev` - Development with watch mode
- `pnpm build` - Production build
- `pnpm lint` - ESLint with auto-fix
- `pnpm test` - Unit tests
- `pnpm test:e2e` - End-to-end tests

**Tech Stack**:
- NestJS with TypeScript
- Dual database support (TypeORM + Mongoose)
- Class-validator/transformer for DTOs
- `validator.js` for value object validation
- Domain events with aggregate pattern

## Common Implementation Patterns

**Adding New Features**:
1. Start with domain: aggregate, value objects, events, repo interface
2. Create use cases in application layer
3. Implement repository in infrastructure
4. Add controller in presentation layer
5. Wire dependencies in NestJS modules
6. Register use case factories in `@infra/use-case/index.ts`
7. Import module in `presentation.module.ts`

**Error Handling**: Use `TRANSLATOR_KEY` constants and `ResultSpecification` pattern throughout. Controllers translate domain errors to HTTP responses using `AcceptLanguage` decorator.

**Domain Events**: Add via aggregate's `addDomainEvent()`, clear after persistence. Infrastructure handles event publishing.

**Best Practices**:
- Never expose internal props of aggregates/entities directly; use individual getters
- Always use professional validation libraries (e.g. `validator.js`) for VOs
- Keep all mutations inside aggregates, not outside
- Make VOs and entities immutable where possible

When extending this codebase, maintain strict layer boundaries and follow the established factory patterns for consistent domain modeling.
```
