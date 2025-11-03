import { useReducer } from "react";

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

type MutationActionType =
  | { type: "START" }
  | { type: "ERROR"; error: MutationErrorType }
  | { type: "DONE" }
  | { type: "RESET" };

function mutationReducer(
  _state: { state: MutationState; error: MutationErrorType },
  action: MutationActionType,
) {
  if (action.type === "START") return { state: MutationState.loading, error: null };
  if (action.type === "ERROR") return { state: MutationState.error, error: action.error };
  if (action.type === "DONE") return { state: MutationState.done, error: null };
  if (action.type === "RESET") return { state: MutationState.idle, error: null };
  throw new Error("Unknown useMutation action type");
}

export function useMutation(options: UseMutationOptions): UseMutationReturnType {
  const [mutation, dispatch] = useReducer(mutationReducer, { state: MutationState.idle, error: null });

  const mutate = async () => {
    if (mutation.state === MutationState.loading) return;

    dispatch({ type: "START" });

    try {
      const response = await options.perform();

      if (!response.ok) {
        dispatch({ type: "ERROR", error: null });
        await options.onError?.(null);
        return;
      }

      dispatch({ type: "DONE" });
      await options.onSuccess?.(response);

      if (options.autoResetDelayMs) {
        setTimeout(() => dispatch({ type: "RESET" }), options.autoResetDelayMs);
      }

      return response;
    } catch (error) {
      dispatch({ type: "ERROR", error });
      await options.onError?.(error);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await mutate();
  };

  return {
    state: mutation.state,
    error: mutation.error,
    isIdle: mutation.state === MutationState.idle,
    isLoading: mutation.state === MutationState.loading,
    isError: mutation.state === MutationState.error,
    isDone: mutation.state === MutationState.done,
    mutate,
    handleSubmit,
    reset: () => dispatch({ type: "RESET" }),
  };
}
