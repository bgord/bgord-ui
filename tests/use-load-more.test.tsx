import { describe, expect, jest, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { type LoadMorePageType, LoadMoreState, useLoadMore } from "../src/hooks/use-load-more";

type Page = LoadMorePageType<string, number>;
type Props = { key: unknown; first?: Page };

const first: Page = { entries: ["a", "b"], next: 2 };
const second: Page = { entries: ["c", "d"], next: 4 };
const last: Page = { entries: ["e"], next: null };
const refreshed: Page = { entries: ["b", "c"], next: 3 };
const refreshedSecond: Page = { entries: ["d", "e"], next: null };

describe("useLoadMore", () => {
  test("first", () => {
    const load = jest.fn();
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));

    expect(result.current.entries).toEqual(["a", "b"]);
    expect(result.current.next).toEqual(2);
    expect(result.current.state).toEqual(LoadMoreState.idle);
    expect(load).not.toHaveBeenCalled();
  });

  test("without first", () => {
    const { result } = renderHook(() => useLoadMore({ key: null, load: jest.fn() }));

    expect(result.current.entries).toEqual([]);
    expect(result.current.next).toEqual(null);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });

  test("more", async () => {
    const load = jest.fn().mockResolvedValue(second);
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));

    await act(() => result.current.more());

    expect(load).toHaveBeenCalledWith(2);
    expect(result.current.entries).toEqual(["a", "b", "c", "d"]);
    expect(result.current.next).toEqual(4);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });

  test("more - without first", async () => {
    const load = jest.fn().mockResolvedValue(first);
    const { result } = renderHook(() => useLoadMore({ key: null, load }));

    await act(() => result.current.more());

    expect(load).toHaveBeenCalledWith(undefined);
    expect(result.current.entries).toEqual(["a", "b"]);
    expect(result.current.next).toEqual(2);
  });

  test("more - exhausted", async () => {
    const load = jest.fn();
    const { result } = renderHook(() => useLoadMore({ key: null, first: last, load }));

    await act(() => result.current.more());

    expect(load).not.toHaveBeenCalled();
    expect(result.current.entries).toEqual(["e"]);
  });

  test("more - loading", () => {
    const load = jest.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));

    act(() => {
      result.current.more();
      result.current.more();
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual(LoadMoreState.loading);
    expect(result.current.entries).toEqual(["a", "b"]);
  });

  test("more - null", async () => {
    const load = jest.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));

    await act(() => result.current.more());

    expect(result.current.state).toEqual(LoadMoreState.error);
    expect(result.current.entries).toEqual(["a", "b"]);
    expect(result.current.next).toEqual(2);
  });

  test("more - rejected", async () => {
    const load = jest.fn().mockRejectedValue(new Error("Failure"));
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));

    await act(() => result.current.more());

    expect(result.current.state).toEqual(LoadMoreState.error);
    expect(result.current.entries).toEqual(["a", "b"]);
  });

  test("more - after error", async () => {
    const load = jest.fn().mockRejectedValueOnce(new Error("Failure")).mockResolvedValueOnce(second);
    const { result } = renderHook(() => useLoadMore({ key: null, first, load }));
    await act(() => result.current.more());

    await act(() => result.current.more());

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual(LoadMoreState.idle);
    expect(result.current.entries).toEqual(["a", "b", "c", "d"]);
  });

  test("key - changed", async () => {
    const load = jest.fn().mockResolvedValue(second);
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: { status: "read" }, first },
    });
    await act(() => result.current.more());

    rerender({ key: { status: "dismissed" }, first: last });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.entries).toEqual(["e"]);
    expect(result.current.next).toEqual(null);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });

  test("key - equal by value", async () => {
    const load = jest.fn().mockResolvedValue(second);
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: { status: "read" }, first },
    });
    await act(() => result.current.more());

    rerender({ key: { status: "read" }, first });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.entries).toEqual(["a", "b", "c", "d"]);
  });

  test("key - changed while loading", async () => {
    let resolve: (page: Page) => void = () => {};
    const load = jest.fn().mockReturnValue(new Promise<Page>((r) => (resolve = r)));
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: { status: "read" }, first },
    });
    act(() => {
      result.current.more();
    });
    rerender({ key: { status: "dismissed" }, first: last });

    await act(async () => resolve(second));

    expect(result.current.entries).toEqual(["e"]);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });

  test("refresh", async () => {
    const load = jest.fn().mockResolvedValueOnce(second).mockResolvedValueOnce(refreshedSecond);
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });
    await act(() => result.current.more());

    await act(async () => rerender({ key: null, first: refreshed }));

    expect(load).toHaveBeenLastCalledWith(3);
    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.entries).toEqual(["b", "c", "d", "e"]);
    expect(result.current.next).toEqual(null);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });

  test("refresh - one page", async () => {
    const load = jest.fn();
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });

    await act(async () => rerender({ key: null, first: refreshed }));

    expect(load).not.toHaveBeenCalled();
    expect(result.current.entries).toEqual(["b", "c"]);
    expect(result.current.next).toEqual(3);
  });

  test("refresh - exhausted early", async () => {
    const load = jest.fn().mockResolvedValueOnce(second).mockResolvedValueOnce(last);
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });
    await act(() => result.current.more());
    await act(() => result.current.more());

    await act(async () => rerender({ key: null, first: refreshedSecond }));

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.entries).toEqual(["d", "e"]);
    expect(result.current.next).toEqual(null);
  });

  test("refresh - loading", async () => {
    const load = jest
      .fn()
      .mockResolvedValueOnce(second)
      .mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });
    await act(() => result.current.more());

    await act(async () => rerender({ key: null, first: refreshed }));

    expect(result.current.state).toEqual(LoadMoreState.loading);
    expect(result.current.entries).toEqual(["a", "b", "c", "d"]);
  });

  test("refresh - error", async () => {
    const load = jest.fn().mockResolvedValueOnce(second).mockResolvedValueOnce(null);
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });
    await act(() => result.current.more());

    await act(async () => rerender({ key: null, first: refreshed }));

    expect(result.current.state).toEqual(LoadMoreState.error);
    expect(result.current.entries).toEqual(["a", "b", "c", "d"]);
  });

  test("refresh - drops in-flight more", async () => {
    let resolve: (page: Page) => void = () => {};
    const load = jest.fn().mockReturnValueOnce(new Promise<Page>((r) => (resolve = r)));
    const { result, rerender } = renderHook((props: Props) => useLoadMore({ ...props, load }), {
      initialProps: { key: null, first },
    });
    act(() => {
      result.current.more();
    });
    await act(async () => rerender({ key: null, first: refreshed }));

    await act(async () => resolve(last));

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.entries).toEqual(["b", "c"]);
    expect(result.current.state).toEqual(LoadMoreState.idle);
  });
});
