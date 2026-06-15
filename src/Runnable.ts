import { RunEvent, RunnableLike, RunnableProps, RunObserver, RunOptions } from "./Runnable.types";
import RunnableSequence from "./RunnableSequence";

/**
 * Abstract class representing a runnable task.
 *
 * Runnable tasks run as pure functions that take an input and produce an output.
 * Runnable tasks can be piped together to form a sequence of operations.
 *
 * @template RunInput - The type of input for the run method.
 * @template RunOutput - The type of output from the run method.
 */
export default abstract class Runnable<RunInput, RunOutput> {
  /**
   * The user specified name
   * @private
   */
  #name?: string;

  protected constructor(props: RunnableProps) {
    this.#name = props.name;
  }

  /**
   * Gets the name of the runnable task.
   * If no name is set, it defaults to the class name.
   *
   * @returns The name of the runnable task.
   */
  get name(): string {
    return this.#name || this.constructor.name;
  }

  set name(n: string) {
    this.#name = n;
  }

  private notifyObservers(
    observers: RunObserver[],
    callbackName: keyof RunObserver,
    event: RunEvent,
  ) {
    if (observers.length === 0) return;
    for (const observer of observers) {
      const callback = observer[callbackName];
      if (callback) {
        callback(event);
      }
    }
  }

  /**
   * The public interface to run the runnable.
   *
   * @param input - The input for the runnable task.
   * @param [options] - An optional run options object, such as containing observers.
   * @returns The output of the runnable task.
   */
  async run(input: RunInput, options?: RunOptions): Promise<RunOutput> {
    const startTime = Date.now();
    const observers = options?.observers || [];
    let output: RunOutput | undefined;
    let error: Error | undefined;

    this.notifyObservers(observers, "onStart", {
      runnable: this,
      input,
      startTime,
    });

    try {
      output = await this._run(input, options);
      const endTime = Date.now();
      this.notifyObservers(observers, "onEnd", {
        runnable: this,
        input,
        output,
        startTime,
        endTime,
      });
      return output;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      this.notifyObservers(observers, "onError", {
        runnable: this,
        input,
        startTime,
        error,
      });
      throw error;
    }
  }

  /**
   * Create a new runnable sequence that runs each individual runnable in series,
   * piping the output of one runnable into another runnable or runnable-like.
   *
   * @template NewRunOutput - The type of output for the new runnable.
   * @param runnableLike - A runnable, function, or object whose values are functions or runnables.
   * @returns A new runnable sequence.
   */
  pipe<NewRunOutput>(
    runnableLike: RunnableLike<RunOutput, NewRunOutput>,
  ): RunnableSequence<RunInput, NewRunOutput> {
    return RunnableSequence.from([this]).pipe(runnableLike);
  }

  /**
   * Abstract method to be implemented by subclasses to execute the task.
   * This method should contain the core logic of the runnable task.
   *
   * @param input - The input for the runnable task.
   * @param [options] - An optional run options object.
   * @returns The output of the runnable task.
   */
  protected abstract _run(input: RunInput, options?: RunOptions): Promise<RunOutput>;
}
