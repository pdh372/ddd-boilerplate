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
- Use `generate()` for new unique IDs (IdVO uses UUID v4)
- Implement `equals(other)` for value-based equality
- Make VOs immutable (`readonly` props, freeze objects)
- For email validation, use `validator.js`'s `isEmail()` and `normalizeEmail()` for robust, RFC-compliant checks
- IdVO supports MongoDB ObjectId and UUID formats with automatic validation

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
- Always inject interface, not implementation using dependency tokens
- Mappers convert between domain aggregates and database entities using `toDomain()` method
- Use `Entity.fromValue()` for DB reconstruction, `Entity.validate()` for external input

### Use Case Pattern

All business logic flows through use cases implementing `UseCase<IRequest, IResponse>`:

```typescript
export class CreateUserUseCase implements UseCase<ICreateUserDto, UserAggregate> {
  async execute(input: ICreateUserDto): Promise<ResultSpecification<UserAggregate>> {
    // 1. Validate inputs using VO.validate()
    const email = UserEmail.validate(input.email);
    if (email.isFailure) return ResultSpecification.fail(email.error);

    // 2. Check business rules (e.g., uniqueness)
    const existing = await this.repository.findByEmail(email.getValue);
    if (existing) return ResultSpecification.fail({ errorKey: 'EMAIL_EXISTS' });

    // 3. Create aggregate and save
    const user = UserAggregate.create({ email: email.getValue, name: name.getValue });
    if (user.isFailure) return user;

    return ResultSpecification.ok(await this.repository.save(user.getValue));
  }
}
```

````

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
1. **Domain first**: Create aggregate, value objects, events, repository interface in `src/module/{context}/domain/`
2. **Application layer**: Add use cases and DTOs in `src/module/{context}/app/`
3. **Infrastructure**: Implement repository in `src/infra/repo/{typeorm|mongoose}/`
4. **Dependency tokens**: Create token symbols in `src/module/{context}/{context}.token.ts`
5. **Use case factories**: Register in `@infra/use-case/index.ts` with proper injection
6. **Presentation**: Add controller in `src/presentation/web/{context}/`
7. **Module wiring**: Create NestJS module with providers from `USE_CASE` factory
8. **Global import**: Add new module to `src/presentation/presentation.module.ts`

**Error Handling**: Use `TRANSLATOR_KEY` constants and `ResultSpecification` pattern throughout. Controllers translate domain errors to HTTP responses using `AcceptLanguage` decorator:

```typescript
if (result.isFailure) {
  throw new HttpException(
    acceptLanguage({ key: result.errorKey, param: result.errorParam }),
    ERROR_STATUS_CODE[result.errorKey]
  );
}
````

**Domain Events**: Add via aggregate's `addDomainEvent()`, clear after persistence. Infrastructure handles event publishing.

**Best Practices**:

- Never expose internal props of aggregates/entities directly; use individual getters
- Always use professional validation libraries (e.g. `validator.js`) for VOs
- Keep all mutations inside aggregates, not outside
- Make VOs and entities immutable where possible

**Dependency Injection Pattern**: Use factory pattern in `@infra/use-case/index.ts`:

```typescript
export const USE_CASE = {
  USER: {
    CREATE_USER: {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (userRepo: IUserRepository) => new CreateUserUseCase(userRepo),
    },
  },
};
```

When extending this codebase, maintain strict layer boundaries and follow the established factory patterns for consistent domain modeling.

```

```
