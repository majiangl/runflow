import Runnable from "./Runnable";
import { coerceToRunnable } from "./utils";
import { RunnableLike, RunOptions } from "./Runnable.types";
import { Branch, BranchLike, RunnableBranchProps } from "./RunnableBranch.types";

/**
 * Runnable that selects which branch to run based on a condition.
 * The Runnable is initialized with a list of [condition, Runnable] pairs and a default branch.
 *
 * When operating on an input, the first condition that evaluates to True is selected,
 * and the corresponding Runnable is run on the input.
 *
 * If no condition evaluates to True, the default branch is run on the input.
 *
 * @example
 * ```TypeScript
 * const branch = RunnableBranch.from<number, string>([
 *   [( input ) => input >= 60, ( input ) => 'Passed'],
 *   [( input ) => 'Failed'],
 * ]);
 * const result1 = await branch.run(75); // result1: 'Passed'
 * const result2 = await branch.run(45); // result2: 'Failed'
 * ```
 *
 * @template RunInput - The type of input for the run method.
 * @template RunOutput - The type of output from the run method.
 */
export default class RunnableBranch<RunInput, RunOutput> extends Runnable<RunInput, RunOutput> {
  /**
   * The conditional branches of the runnable branch.
   * Each branch is a tuple of a condition and a runnable task.
   *
   * @private
   */
  readonly #conditionalBranches: Branch<RunInput, RunOutput>[];

  /**
   * The default branch to run if no conditions are met.
   *
   * @private
   */
  readonly #defaultBranch: Runnable<RunInput, RunOutput>;

  constructor(props: RunnableBranchProps<RunInput, RunOutput>) {
    super(props);

    const { branches } = props;
    this.#conditionalBranches = (branches.slice(0, -1) as BranchLike<RunInput, RunOutput>[]).map(
      ([condition, branch]) => {
        return [coerceToRunnable(condition), coerceToRunnable(branch)];
      },
    );
    this.#defaultBranch = coerceToRunnable(
      branches[branches.length - 1] as RunnableLike<RunInput, RunOutput>,
    );
  }

  static from<RunInput, RunOutput>(
    branches: RunnableBranchProps<RunInput, RunOutput>["branches"],
    name?: string,
  ): RunnableBranch<RunInput, RunOutput> {
    return new RunnableBranch<RunInput, RunOutput>({
      branches: branches,
      name,
    });
  }

  async _run(input: RunInput, options?: RunOptions): Promise<RunOutput> {
    for (const [condition, branch] of this.#conditionalBranches) {
      if (await condition.run(input, options)) {
        return await branch.run(input, options);
      }
    }
    return await this.#defaultBranch.run(input, options);
  }
}
