import { describe, expect, jest, spyOn, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MutationState, useMutation } from "../src/hooks/use-mutation";

const url = "http://example.com";

describe("useMutation", () => {
  test("idle", () => {
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - success", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(result.current.state).toEqual(MutationState.done);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(true);
  });

  test("mutate - error - response.ok", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    const onError = jest.fn();
    const form = document.createElement("form");
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url), onError }));

    await act(() => result.current.mutate(form));

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(onError).toHaveBeenCalledWith(null, { form });
    expect(result.current.state).toEqual(MutationState.error);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - error", async () => {
    const error = "Failure";
    using fetchSpy = spyOn(global, "fetch").mockRejectedValue(error);
    const onError = jest.fn();
    const form = document.createElement("form");
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url), onError }));

    await act(() => result.current.mutate(form));

    expect(fetchSpy).toHaveBeenCalledWith(url);
    expect(onError).toHaveBeenCalledWith(error, { form });
    expect(result.current.state).toEqual(MutationState.error);
    expect(result.current.error).toEqual(error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - loading", () => {
    using _ = spyOn(global, "fetch").mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    act(() => {
      result.current.mutate();
    });

    expect(result.current.state).toEqual(MutationState.loading);
    expect(result.current.isLoading).toEqual(true);
  });

  test("mutate - after error", async () => {
    using fetchSpy = spyOn(global, "fetch").mockRejectedValue("Failure");
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));
    await act(() => result.current.mutate());

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("mutate - autoResetDelayMs", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url), autoResetDelayMs: 50 }));
    await act(() => result.current.mutate());
    expect(result.current.state).toEqual(MutationState.done);

    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));

    expect(result.current.state).toEqual(MutationState.idle);
  });

  test("mutate - no autoResetDelayMs", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));
    await act(() => result.current.mutate());

    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(result.current.state).toEqual(MutationState.done);
  });

  test("handleSubmit", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const onSuccess = jest.fn();
    const form = document.createElement("form");
    const event = {
      preventDefault: jest.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url), onSuccess }));

    await act(() => result.current.handleSubmit(event));

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(expect.any(Response), { form });
  });

  test("reset", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));
    await act(() => result.current.mutate());

    act(() => result.current.reset());

    expect(result.current.state).toEqual(MutationState.idle);
    expect(result.current.error).toEqual(null);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.isDone).toEqual(false);
  });

  test("mutate - concurrent calls", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    await act(() => Promise.all([result.current.mutate(), result.current.mutate()]));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("mutate - during onSuccess", async () => {
    using fetchSpy = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url), onSuccess }));
    onSuccess.mockImplementationOnce(async () => {
      await result.current.mutate();
    });

    await act(() => result.current.mutate());

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("mutate - after reset during loading", async () => {
    using fetchSpy = spyOn(global, "fetch").mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));
    act(() => {
      result.current.mutate();
    });
    act(() => result.current.reset());

    act(() => {
      result.current.mutate();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("integration - success", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json({}));
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

    expect(document.body.contains(screen.getByText("Fill the form"))).toEqual(true);

    await act(async () => fireEvent.click(screen.getByText("Send")));

    expect(document.body.contains(screen.getByText("Success"))).toEqual(true);
  });

  test("integration - error", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
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

    expect(document.body.contains(screen.getByText("Fill the form"))).toEqual(true);

    await act(async () => fireEvent.click(screen.getByText("Send")));

    expect(document.body.contains(screen.getByText("Error"))).toEqual(true);
  });
});
