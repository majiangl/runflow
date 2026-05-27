import Runnable from "./Runnable";

/**
 * A Runnable that simply returns the input as output.
 * It is useful for cases where you want to pass data through without any transformation.
 *
 * @template RunInput - The type of the input and output.
 */
export default class RunnablePassThrough<RunInput> extends Runnable<RunInput, RunInput> {
  async _run(input: RunInput): Promise<RunInput> {
    return input;
  }
}
