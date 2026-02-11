import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MutationState, useMutation } from "../src/hooks/use-mutation";

afterEach(() => cleanup());

const url = "http://example.com";

describe("useTextField", () => {
  test("idle", () => {
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
    expect(typeof result.current.mutate).toEqual("function");
    expect(typeof result.current.handleSubmit).toEqual("function");
    expect(typeof result.current.reset).toEqual("function");
  });

  test("mutate - success", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(result.current.state).toEqual(MutationState.done);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(true);

    act(() => result.current.reset());

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - error - response.ok", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue({ ok: false } as any);
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(result.current.state).toEqual(MutationState.error);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.isDone).toEqual(false);

    act(() => result.current.reset());

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - error", async () => {
    const error = "Failure";
    using fetchSpy = spyOn(global, "fetch").mockRejectedValue(error);
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(result.current.state).toEqual(MutationState.error);
    expect(result.current.error).toEqual(error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.isDone).toEqual(false);

    act(() => result.current.reset());

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
  });

  test("integration - success", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    function Testcase() {
      const mutation = useMutation({ perform: () => fetch(url) });

      return (
        <form onSubmit={mutation.handleSubmit}>
          <button type="submit">Send</button>
          {mutation.isIdle && <output>Fill the form</output>}
          {mutation.isDone && <output>Success</output>}
        </form>
      );
    }

    render(<Testcase />);

    expect(screen.findByText("Fill the form"));

    await act(() => userEvent.click(screen.getByText("Send")));

    expect(screen.findByText("Success"));
  });

  test("integration - error", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue({ ok: false } as any);
    function Testcase() {
      const mutation = useMutation({ perform: () => fetch(url) });

      return (
        <form onSubmit={mutation.handleSubmit}>
          <button type="submit">Send</button>
          {mutation.isIdle && <output>Fill the form</output>}
          {mutation.isError && <output>Error</output>}
        </form>
      );
    }

    render(<Testcase />);

    expect(screen.findByText("Fill the form"));

    await act(() => userEvent.click(screen.getByText("Send")));

    expect(screen.findByText("Error"));
  });
});
