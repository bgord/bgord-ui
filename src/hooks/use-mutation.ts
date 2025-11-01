import { useCallback, useState } from "react";

export enum MutationState {
  idle = "idle",
  loading = "loading",
  error = "error",
  done = "done",
}

type MutationErrorType = unknown;

type UseMutationOptions = {
  perform: () => Promise<Response>;
  onSuccess?: (response: Response) => void | Promise<void>;
  onError?: (error: MutationErrorType) => void | Promise<void>;
  autoResetDelayMs?: number;
};

type UseMutationReturnType = {
  state: MutationState;
  error: MutationErrorType;
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
  mutate: () => Promise<Response | undefined>;
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
  reset: () => void;
};

export function useMutation(options: UseMutationOptions): UseMutationReturnType {
  const [state, setState] = useState<MutationState>(MutationState.idle);
  const [error, setError] = useState<MutationErrorType>(null);

  const reset = useCallback(() => {
    setError(null);
    setState(MutationState.idle);
  }, []);

  const mutate = useCallback(async () => {
    if (state === MutationState.loading) return;

    setError(null);
    setState(MutationState.loading);

    try {
      const response = await options.perform();

      if (!response.ok) {
        setState(MutationState.error);
        setError(null);
        await options.onError?.(null);
      }

      setState(MutationState.done);
      await options.onSuccess?.(response);

      if (options.autoResetDelayMs) {
        setTimeout(() => setState(MutationState.idle), options.autoResetDelayMs);
      }

      return response;
    } catch (error) {
      setState(MutationState.error);
      setError(error);
      await options.onError?.(error);
      throw error;
    }
  }, [state, options]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      await mutate();
    },
    [mutate],
  );

  return {
    state,
    error,
    isIdle: state === MutationState.idle,
    isLoading: state === MutationState.loading,
    isError: state === MutationState.error,
    isDone: state === MutationState.done,
    mutate,
    handleSubmit,
    reset,
  };
}
