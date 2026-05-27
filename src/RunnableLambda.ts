import Runnable from "./Runnable";
import { RunnableFunction } from "./Runnable.types";
import { RunnableLambdaProps } from "./RunnableLambda.types";

/**
 * Runnable that converts a function into a Runnable. Wrapping a function in a `RunnableLambda`
 * makes the function usable in a sequence of operations, allowing it to be piped.
 *
 * @example
 * ```TypeScript
 * const square = RunnableLambda.from<number, number>((x) => x * x);
 * const result = await square.run(5); // result will be 25
 * ```
 *
 * @template RunInput - The type of the input to the function.
 * @template RunOutput - The type of the output from the function.
 */
export default class RunnableLambda<RunInput, RunOutput> extends Runnable<RunInput, RunOutput> {
  /**
   * The function to perform the task.
   * @private
   */
  readonly #fn: RunnableFunction<RunInput, RunOutput>;

  constructor(props: RunnableLambdaProps<RunInput, RunOutput>) {
    super(props);
    this.#fn = props.fn;
  }

  static from<RunInput, RunOutput>(
    fn: RunnableFunction<RunInput, RunOutput>,
    name?: string,
  ): RunnableLambda<RunInput, RunOutput> {
    return new RunnableLambda<RunInput, RunOutput>({
      name: name,
      fn,
    });
  }

  async _run(input: RunInput): Promise<RunOutput> {
    return this.#fn(input);
  }
}
