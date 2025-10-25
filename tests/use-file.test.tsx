import { describe, expect, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { UseFileState, useFile } from "../src/hooks/use-file";

const file = new File(["x"], "avatar.png", { type: "image/png" });
const bigFile = new File(["xx"], "avatar.png", { type: "image/png" });

function changeEvent(files: File[]) {
  return { currentTarget: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useFile", () => {
  test("idle", () => {
    const hook = renderHook(() => useFile("file"));
    const result = hook.result.current;

    expect(result.state).toEqual(UseFileState.idle);
    expect(typeof result.matches).toEqual("function");
    expect(result.isIdle).toEqual(true);
    expect(result.isSelected).toEqual(false);
    expect(result.isError).toEqual(false);
    expect(result.data).toEqual(null);
    expect(typeof result.actions.selectFile).toEqual("function");
    expect(typeof result.actions.clearFile).toEqual("function");
    expect(result.label).toEqual({ props: { htmlFor: "file" } });
    expect(result.input).toEqual({ props: { id: "file", name: "file", multiple: false }, key: 0 });
  });

  test("idle - no file in the list", () => {
    const { result } = renderHook(() => useFile("file"));

    act(() => result.current.actions.selectFile(changeEvent([])));

    expect(result.current.state).toEqual(UseFileState.idle);
    expect(result.current.data).toEqual(null);
  });

  test("selected", () => {
    spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");

    const { result } = renderHook(() => useFile("file"));

    act(() => result.current.actions.selectFile(changeEvent([file])));

    expect(result.current.state).toEqual(UseFileState.selected);
    expect(result.current.isSelected).toEqual(true);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.data).toEqual(file);
    // @ts-expect-error
    expect(result.current.preview).toEqual("blob:preview");

    act(() => result.current.actions.clearFile());

    expect(result.current.state).toEqual(UseFileState.idle);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.data).toEqual(null);
  });

  test("error - too big", () => {
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1 }));

    act(() => result.current.actions.selectFile(changeEvent([bigFile])));

    expect(result.current.state).toEqual(UseFileState.error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.data).toEqual(null);
  });
});
