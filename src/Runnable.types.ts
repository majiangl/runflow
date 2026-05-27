import Runnable from "./Runnable";

export interface RunnableProps {
  name?: string;
}

export type RunnableFunction<RunInput, RunOutput> = (
  input: RunInput,
) => RunOutput | Promise<RunOutput>;

export type RunnableMap<RunInput, RunOutput> = {
  [K in keyof RunOutput]: RunnableLike<RunInput, RunOutput[K]>;
};

export type RunnableLike<RunInput, RunOutput> =
  | Runnable<RunInput, RunOutput>
  | RunnableFunction<RunInput, RunOutput>
  | RunnableMap<RunInput, RunOutput>;

export interface RunEvent<Input = unknown, Output = unknown> {
  runnable: Runnable<Input, Output>;
  input: Input;
  output?: Output;
  error?: Error;
  startTime: number;
  endTime?: number;
}

export interface RunObserver {
  onStart?: (event: RunEvent) => void;
  onEnd?: (event: RunEvent) => void;
  onError?: (event: RunEvent) => void;
}

export interface RunOptions {
  observers?: RunObserver[];
}
