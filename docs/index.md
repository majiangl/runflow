# RunFlow

## Overview
`runflow` is a TypeScript library designed to compose, execute, and monitor asynchronous workflows. It leverages a pattern of composable "Runnables" (pure functions) that can be linked together into sophisticated pipelines, supporting sequential, branching, parallel, and looping execution paradigms.

## Folder Structure
The repository is organized as follows:

- `src/`: Contains the core source code of the library.
  - `index.ts`: The main entry point exposing library exports.
  - `Runnable.ts`: The abstract base class for all runnables.
  - `Runnable*.ts`: Various runnable implementations (e.g., `RunnableSequence.ts`, `RunnableBranch.ts`, etc.).
  - `Runnable*.types.ts`: TypeScript type definitions for the respective runnables.
  - `utils.ts`: Internal utility functions such as `coerceToRunnable`.
- `docs/`: Documentation files, including the core architecture guide.
- `package.json`, `tsconfig.json`, `eslint.config.mjs`: Central configuration for Node, TypeScript, and linting.

## Architectural Concepts
The core design philosophy circles around the **Runnable** interface. Every step in a workflow is a `Runnable` that defines an input type (`RunInput`) and an output type (`RunOutput`), returning a `Promise<RunOutput>`.

Workflows are constructed by piping runnables representing each step, including basic runnables and flow-control runnables.

### Core Interface
- **`Runnable<RunInput, RunOutput>`**: An abstract base class for all workflow components. It implements the standard `run(input, options)` interface and delegates the specific execution logic to an abstract `_run(input, options)` method. To enable composition, it provides a `pipe(runnableLike)` method allowing any runnable to flow into the next.

### Basic Runnables
These are the building blocks of any workflow, representing the actual processing logic. They can be as simple as a function that transforms data or as complex as an API call.

- **`RunnableLambda`**: Accepts a  JavaScript function and wraps it as a `Runnable`. This allows you to easily implement a runnable step within a workflow.
- **`RunnablePassThrough`**: Provides no-op transitions across the sequence. Simply yields its input as its output. Useful as a placeholder or to tap a pipeline without transformation.

### Flow-Control Runnables
These subclasses direct the control flow of the application based on varying internal rules:

- **`RunnableSequence`**: Pipes the output of one step into the input of the next. Acts as a linear pipeline.
- **`RunnableBranch`**: Evaluates conditions (which are themselves runnables returning a boolean) and routes the input into the corresponding executable branch. Similar to `if/else` or a `switch` statement but completely asynchronous and strongly typed.
- **`RunnableLoop`**: Allows repeating a single task. It supports iterating over an array (acting like a map) or running a fixed number of times for the same input.
- **`RunnableParallel`**: Accepts an object whose values are runnable tasks. It executes all tasks concurrently, passing in the same source input, and returns an aggregated object of outputs.

### Coercion / Syntactic Sugar
A key element to keeping developer experience (DX) streamlined is the **`coerceToRunnable`** utility mechanism. This accepts a union `RunnableLike` type and implicitly converts primitives into formal runnables:
- Standalone Native Functions `->` wrapped in `RunnableLambda`
- JavaScript Objects/Records `->` wrapped in `RunnableParallel`
- Pre-instantiated Runnables `->` left as is.

## Monitoring & Telemetry
While the `.run()` method on runnables functions perfectly on its own, production scenarios often expect isolation and measurement.

To enable this natively, `runflow` uses the **Observer Pattern** architecture built directly into the base `Runnable` class lifecycle to broadcast real-time telemetry events. Developers can simply pass an array of `RunObserver` objects (`observers: [...]`) as options into `.run()`.

### Events and Observers
When the pipeline runs organically via `await myWorkflow.run(input, { observers: [...] })`, dynamic `RunEvent` objects are generated across the tree.

Each step (`Runnable`) within a workflow will trigger:
1. `onStart(event)`: Emits when a step begins processing. Gives you access to the step's identity (the `.runnable` reference), the `input` payload, and the `startTime`.
2. `onEnd(event)`: Emits when a step successfully concludes. You get access to the transformed `.output` payload, the step identity, and the `endTime`.
3. `onError(event)`: Emits if the step throws an exception, providing the extracted `.error`.

This non-intrusive stream makes it easy to tie directly into structured logs, analytical backends (like Prometheus or Datadog), or UI execution dashboards.
