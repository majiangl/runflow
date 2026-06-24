# RunFlow

## Overview

`runflow` is a TypeScript library for composing, executing, and monitoring asynchronous workflows. It uses composable **Runnables** — pure functions linked into pipelines that support sequential, branching, parallel, and looping execution.

## Folder Structure

- `src/`: Core library source code.
  - `index.ts`: Main entry point exposing library exports.
  - `Runnable.ts`: Abstract base class for all runnables.
  - `Runnable*.ts`: Runnable implementations (e.g., `RunnableSequence.ts`, `RunnableBranch.ts`).
  - `Runnable*.types.ts`: TypeScript type definitions for each runnable.
  - `utils.ts`: Internal utilities such as `coerceToRunnable`.
- `docs/`: Documentation files.
- `package.json`, `tsconfig.json`, `eslint.config.mjs`: Configuration for Node, TypeScript, and linting.

## Architectural Concepts

The core design centers on the **Runnable** interface. Every workflow step is a `Runnable` that declares an input type (`RunInput`) and an output type (`RunOutput`), and returns a `Promise<RunOutput>`. Workflows are built by piping runnables together — combining basic runnables (processing logic) with flow-control runnables (routing).

### Core Interface

- **`Runnable<RunInput, RunOutput>`**: Abstract base class for all workflow components. It exposes a `run(input, options)` method and delegates execution to an abstract `_run(input, options)` method. A `pipe(runnableLike)` method enables composition by chaining any runnable into the next.

### Basic Runnables

Basic runnables are the processing building blocks of a workflow — from simple data transforms to complex API calls.

- **`RunnableLambda`**: Wraps a JavaScript function as a `Runnable`, letting you implement any workflow step inline.

### Flow-Control Runnables

These runnables direct workflow control flow:

- **`RunnableSequence`**: Pipes the output of each step into the input of the next, forming a linear pipeline.
- **`RunnableBranch`**: Evaluates conditions (runnables returning a boolean) and routes input to the matching branch — an async, strongly-typed `if/else` or `switch`.
- **`RunnableParallel`**: Accepts an object of runnable tasks, executes them concurrently with the same input, and returns an aggregated output object.

### Coercion

**`coerceToRunnable`** accepts a `RunnableLike` union type and converts values into formal runnables, reducing boilerplate:

- Plain functions → wrapped in `RunnableLambda`
- Plain objects/records → wrapped in `RunnableParallel`
- Existing `Runnable` instances → passed through unchanged

## Monitoring & Telemetry

`runflow` implements the **Observer Pattern** directly in the base `Runnable` class to emit real-time telemetry events. Pass an array of `RunObserver` objects via the `observers` option to `.run()`:

```ts
await myWorkflow.run(input, { observers: [...] });
```

### Events

Each `Runnable` in the pipeline emits `RunEvent` objects at key lifecycle points:

1. **`onStart(event)`** — emits when a step begins.
   - `runnable`: The current `Runnable` instance.
   - `input`: The input payload.
   - `startTime`: Epoch timestamp when execution began.

2. **`onEnd(event)`** — emits when a step completes successfully.
   - `runnable`: The current `Runnable` instance.
   - `input`: The input payload.
   - `output`: The transformed output payload.
   - `startTime`: Epoch timestamp when execution began.
   - `endTime`: Epoch timestamp when execution finished.

3. **`onError(event)`** — emits when a step throws an exception.
   - `runnable`: The current `Runnable` instance.
   - `input`: The input payload.
   - `error`: The caught `Error` object.
   - `startTime`: Epoch timestamp when execution began.

This event stream integrates directly with structured logs, analytics backends (such as Prometheus or Datadog), or execution dashboards.
