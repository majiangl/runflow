# Code Conventions

## File Co-location

Place a module's implementation, types, and tests in the same directory:

- `module.ts` — implementation
- `module.types.ts` — types and interfaces
- `module.test.ts` — tests

## Comments

Comment *why*, not *what*. Explain non-obvious logic, intent, and edge cases — not what the code literally does.

```ts
// BAD
i++; // increment i

// GOOD
// Skip the last element — it is always the default branch
branches.slice(0, -1).forEach(/*...*/);
```

### JSDoc

All public classes and methods require JSDoc.

