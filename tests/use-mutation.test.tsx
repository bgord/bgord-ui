import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MutationState, useMutation } from "../src/hooks/use-mutation";

afterEach(() => cleanup());

const url = "http://example.com";

describe("useTextField", () => {
  test("idle", () => {
    const { result } = renderHook(() => useMutation({ perform: () => fetch(url) }));

    console.log(result);
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
});
