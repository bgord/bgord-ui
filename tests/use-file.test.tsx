import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { UseFileState, useFile } from "../src/hooks/use-file";

const mimeTypes = ["image/png"];

const png = new File(["x"], "avatar.png", { type: "image/png" });
const jpeg = new File(["x"], "avatar.png", { type: "image/jpeg" });
const bigPng = new File(["xx"], "avatar.png", { type: "image/png" });

function changeEvent(files: ReadonlyArray<File>) {
  return { currentTarget: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

afterEach(() => cleanup());

describe("useFile", () => {
  test("idle", () => {
    const hook = renderHook(() => useFile("file", { mimeTypes }));
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
    expect(result.input).toEqual({
      props: { id: "file", name: "file", multiple: false, accept: mimeTypes[0] },
      key: 0,
    });
  });

  test("idle - no file in the list", () => {
    const { result } = renderHook(() => useFile("file", { mimeTypes }));

    act(() => result.current.actions.selectFile(changeEvent([])));

    expect(result.current.state).toEqual(UseFileState.idle);
    expect(result.current.data).toEqual(null);
  });

  test("selected", () => {
    spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    const { result } = renderHook(() => useFile("file", { mimeTypes }));

    act(() => result.current.actions.selectFile(changeEvent([png])));

    expect(result.current.state).toEqual(UseFileState.selected);
    expect(result.current.isSelected).toEqual(true);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.data).toEqual(png);
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
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1, mimeTypes }));

    act(() => result.current.actions.selectFile(changeEvent([bigPng])));

    expect(result.current.state).toEqual(UseFileState.error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.data).toEqual(null);
  });

  test("error - invalid mime", () => {
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1, mimeTypes }));

    act(() => result.current.actions.selectFile(changeEvent([jpeg])));

    expect(result.current.state).toEqual(UseFileState.error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.data).toEqual(null);
  });

  test("integration", async () => {
    function Testcase() {
      const file = useFile("file", { mimeTypes });

      return (
        <div>
          <label {...file.label.props}>
            <input
              data-testid="file-input"
              type="file"
              onChange={file.actions.selectFile}
              {...file.input.props}
            />
          </label>

          {file.isSelected && <output>{file.data.name}</output>}

          <button type="button" onClick={file.actions.clearFile}>
            Clear
          </button>
        </div>
      );
    }

    render(<Testcase />);

    expect(screen.queryByText(png.name)).toBeNull();

    act(() => fireEvent.change(screen.getByTestId("file-input"), { target: { files: [png] } }));

    await screen.findByText(png.name);

    act(() => fireEvent.click(screen.getByText("Clear")));

    expect(screen.queryByText(png.name)).toBeNull();
  });
});
