import Runnable from "./Runnable";
import { coerceToRunnable } from "./utils";
import { RunOptions, RunnableLike } from "./Runnable.types";
import { RunnableSequenceArray, RunnableSequenceProps } from "./RunnableSequence.types";

/**
 * Runnable that executes a sequence of steps in order. Each step can be any runnable-like,
 * and the output of each step is passed as input to the next step.
 *
 * @example
 * ```TypeScript
 * const add = ({a, b}: { a: number; b: number}) => a + b;
 * const square = (x: number) => x * x;
 *
 * const sequence = RunnableSequence.from<{ a: number; b: number}, number>([add, square]);
 * const result = await sequence.run({ a: 2, b: 3 }); // result will be 25
 * ```
 *
 * @template RunInput - The type of the input to the first step.
 * @template RunOutput - The type of the output of the last step.
 */
export default class RunnableSequence<RunInput, RunOutput> extends Runnable<RunInput, RunOutput> {
  /**
   * The steps in the sequence.
   * @protected
   */
  protected steps: Runnable<unknown, unknown>[];

  constructor(props: RunnableSequenceProps<RunInput, RunOutput>) {
    super(props);
    this.steps = props.steps.map((step) => coerceToRunnable(step));
  }

  static from<RunInput, RunOutput>(
    steps: RunnableSequenceArray<RunInput, RunOutput>,
    name?: string,
  ): RunnableSequence<RunInput, RunOutput> {
    return new RunnableSequence<RunInput, RunOutput>({
      steps,
      name,
    });
  }

  async _run(input: RunInput, options?: RunOptions): Promise<RunOutput> {
    let output: unknown = input;
    for (const step of this.steps) {
      output = await step.run(output, options);
    }
    return output as RunOutput;
  }

  pipe<NewRunOutput>(
    runnableLike: RunnableLike<RunOutput, NewRunOutput>,
  ): RunnableSequence<RunInput, NewRunOutput> {
    const runnable = coerceToRunnable(runnableLike);

    if (runnable instanceof RunnableSequence) {
      return RunnableSequence.from<RunInput, NewRunOutput>([
        ...this.steps,
        ...runnable.steps,
      ] as RunnableSequenceArray<RunInput, NewRunOutput>);
    }

    return RunnableSequence.from<RunInput, NewRunOutput>([
      ...this.steps,
      runnable,
    ] as RunnableSequenceArray<RunInput, NewRunOutput>);
  }
}
