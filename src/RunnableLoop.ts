import Runnable from "./Runnable";
import { IterateeInput, IterateeOutput, Iterations, RunnableLoopProps } from "./RunnableLoop.types";
import { coerceToRunnable } from "./utils";
import { RunnableLike } from "./Runnable.types";

/**
 * Runnable that executes a given iteratee for a specified number of iterations.
 *
 * If the `IterateInput` is set to true, the `RunInput` is expected to be an array,
 * and the iteratee is executed for each element in that array.
 *
 * If `IterateInput` is false, the iteratee is executed a fixed number of times
 * defined by the `iterations` property, with the same input passed to each execution.
 *
 * The output of the Runnable is an array of results from each execution of the iteratee.
 *
 * @example
 * ```TypeScript
 * const square = (x: number) => x * x;
 *
 * // Usage 1: Iterate the input
 * const loop1 = RunnableLoop.from<number[], number[], true>(square);
 * const result1 = await loop.run([1, 2, 3, 4]); // result1: [1, 4, 9, 16]
 *
 * // Usage 2: Iterate fixed number of iterations
 * const loop2 = RunnableLoop.from<number, number[], false>(square, 3);
 * const result2 = await loop2.run(5); // result2: [25, 25, 25]
 * ```
 *
 * @template RunInput - The type of input for the run method.
 * @template RunOutput - The type of output from the run method, expected to be an array.
 * @template IterateInput - A boolean indicating whether to iterate against the input (true)
 *    or a fixed number of iterations (false).
 */
export default class RunnableLoop<
  RunInput,
  RunOutput extends [],
  IterateInput extends boolean,
> extends Runnable<RunInput, RunOutput> {
  /**
   * The runnable to be executed for each iteration.
   * @private
   */
  readonly #iteratee: Runnable<IterateeInput<RunInput, IterateInput>, IterateeOutput<RunOutput>>;
  /**
   * The number of iterations to run.
   * @private
   */
  readonly #iterations: Iterations<RunInput, IterateInput>;

  constructor(props: RunnableLoopProps<RunInput, RunOutput, IterateInput>) {
    super(props);
    this.#iteratee = coerceToRunnable(props.iteratee);
    this.#iterations = props.iterations;
  }

  static from<RunInput, RunOutput extends [], IterateInput extends boolean>(
    iteratee: RunnableLike<IterateeInput<RunInput, IterateInput>, IterateeOutput<RunOutput>>,
    iterations: Iterations<RunInput, IterateInput>,
    name?: string,
  ): RunnableLoop<RunInput, RunOutput, IterateInput> {
    return new RunnableLoop<RunInput, RunOutput, IterateInput>({
      iteratee,
      iterations,
      name,
    });
  }

  async _run(input: RunInput): Promise<RunOutput> {
    const results: IterateeOutput<RunOutput>[] = [];

    // If iterations is defined, run the iteratee for the specified number of times.
    if (this.#iterations) {
      const iterations =
        typeof this.#iterations === "function"
          ? this.#iterations(input)
          : (this.#iterations as number);

      for (let i = 0; i < iterations; i++) {
        const result = await (
          this.#iteratee as Runnable<IterateeInput<RunInput, false>, IterateeOutput<RunOutput>>
        ).run(input);
        results.push(result);
      }
    } else {
      // If iterations is not defined, run the iteratee for each element in the input array.
      const iterateeInputs = input as IterateeInput<RunInput, true>[];

      for (let i = 0; i < iterateeInputs.length; i++) {
        const result = await (
          this.#iteratee as Runnable<IterateeInput<RunInput, true>, IterateeOutput<RunOutput>>
        ).run(iterateeInputs[i]);
        results.push(result);
      }
    }

    return results as RunOutput;
  }
}
