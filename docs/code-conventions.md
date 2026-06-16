# Code Conventions

## File Co-location

Keep related files together in the same directory:

- `RunnableFoo.ts` — implementation
- `RunnableFoo.types.ts` — types and interfaces specific to this file
- `RunnableFoo.test.ts` — tests for this file

## Comments

Comment *why*, not *what*. Explain non-obvious logic, intent, and edge cases — not what the code literally does.

```ts
// BAD
i++; // increment i

// GOOD
// Skip the last element — it is always the default branch
branches.slice(0, -1).forEach(/*...*/);
```

Public classes and methods require JSDoc. Each class must include an `@example` block using a `TypeScript` code fence.

