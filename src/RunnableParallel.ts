import { coerceToRunnable } from "./utils";
import Runnable from "./Runnable";
import { RunMonitor, RunnableLike, RunnableMap } from "./Runnable.types";
import { RunnableParallelProps } from "./RunnableParallel.types";

/**
 * Runnable that runs a mapping of Runnables in parallel and returns a mapping of their outputs.
 * It invokes Runnables concurrently, providing the same input to each.
 *
 * @example
 * ```TypeScript
 * const parallel = RunnableParallel.from<number[], { sum: number; min: number; max: number}>({
 *   sum: (arr) => arr.reduce((a, b) => a + b, 0),
 *   min: (arr) => Math.min(...arr),
 *   max: (arr) => Math.max(...arr),
 * });
 * const result = await parallel.run([1, 2, 3, 4, 5]); // result: { sum: 15, min: 1, max: 5 }
 * ```
 *
 * @template RunInput - The input type for the Runnables.
 * @template RunOutput - The output type for the Runnables.
 */
export default class RunnableParallel<RunInput, RunOutput> extends Runnable<RunInput, RunOutput> {
  /**
   * A map of step names to Runnables.
   * @private
   */
  readonly #steps: Record<string, Runnable<RunInput, unknown>>;

  constructor(props: RunnableParallelProps<RunInput, RunOutput>) {
    super(props);

    this.#steps = {};
    for (const [key, value] of Object.entries<RunnableLike<RunInput, unknown>>(props.steps)) {
      this.#steps[key] = coerceToRunnable(value);
    }
  }

  static from<RunInput, RunOutput>(
    steps: RunnableMap<RunInput, RunOutput>,
    name?: string,
  ): RunnableParallel<RunInput, RunOutput> {
    return new RunnableParallel<RunInput, RunOutput>({
      steps,
      name,
    });
  }

  async executeTask(input: RunInput, monitor?: RunMonitor): Promise<RunOutput> {
    const output: Record<string, unknown> = {};
    await Promise.all(
      Object.entries(this.#steps).map(async ([key, value]) => {
        output[key] = await value.run(input, monitor);
      }),
    );
    return output as RunOutput;
  }
}
