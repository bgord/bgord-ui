import { describe, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { UseFileState, useFile } from "../src/hooks/use-file";
import * as mocks from "./mocks";

const mimeTypes = ["image/png"];

const png = new File(["x"], "avatar.png", { type: "image/png" });
const jpeg = new File(["x"], "avatar.png", { type: "image/jpeg" });
const bigPng = new File(["xx"], "avatar.png", { type: "image/png" });

describe("useFile", () => {
  test("idle", () => {
    const hook = renderHook(() => useFile("file", { mimeTypes }));
    const result = hook.result.current;

    expect(result.state).toEqual(UseFileState.idle);
    expect(result.isIdle).toEqual(true);
    expect(result.isSelected).toEqual(false);
    expect(result.isError).toEqual(false);
    expect(result.data).toEqual(null);
    expect(result.label).toEqual({ props: { htmlFor: "file" } });
    expect(result.input).toEqual({
      props: { id: "file", name: "file", multiple: false, accept: mimeTypes[0] },
      key: 0,
    });
    expect(result.matches([UseFileState.idle])).toEqual(true);
    expect(result.matches([UseFileState.error, UseFileState.idle])).toEqual(true);
    expect(result.matches([UseFileState.error])).toEqual(false);
  });

  test("idle - no file in the list", () => {
    const { result } = renderHook(() => useFile("file", { mimeTypes }));

    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([])));

    expect(result.current.state).toEqual(UseFileState.idle);
    expect(result.current.data).toEqual(null);
  });

  test("selected", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(URL, "createObjectURL").mockReturnValue("blob:preview"));
    spies.use(spyOn(URL, "revokeObjectURL"));
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1, mimeTypes }));

    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));

    expect(result.current.state).toEqual(UseFileState.selected);
    expect(result.current.isSelected).toEqual(true);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.data).toEqual(png);
    expect(result.current.isSelected && result.current.preview).toEqual("blob:preview");
  });

  test("clearFile", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(URL, "createObjectURL").mockReturnValue("blob:preview"));
    spies.use(spyOn(URL, "revokeObjectURL"));
    const { result } = renderHook(() => useFile("file", { mimeTypes }));
    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));

    act(() => result.current.actions.clearFile());

    expect(result.current.state).toEqual(UseFileState.idle);
    expect(result.current.input.key).toEqual(1);
    expect(result.current.isIdle).toEqual(true);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(false);
    expect(result.current.data).toEqual(null);
  });

  test("clearFile - resets preview", () => {
    using spies = new DisposableStack();
    spies.use(
      spyOn(URL, "createObjectURL").mockReturnValueOnce("blob:first").mockReturnValueOnce("blob:second"),
    );
    spies.use(spyOn(URL, "revokeObjectURL"));
    const previews: Array<string | undefined> = [];
    const { result } = renderHook(() => {
      const file = useFile("file", { mimeTypes });
      if (file.isSelected) previews.push(file.preview);
      return file;
    });
    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));
    act(() => result.current.actions.clearFile());

    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));

    expect(previews).toEqual([undefined, "blob:first", undefined, "blob:second"]);
  });

  test("clearFile - revokes preview", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(URL, "createObjectURL").mockReturnValue("blob:preview"));
    const revokeObjectURL = spies.use(spyOn(URL, "revokeObjectURL"));
    const { result } = renderHook(() => useFile("file", { mimeTypes }));
    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));

    act(() => result.current.actions.clearFile());

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  test("unmount - revokes preview", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(URL, "createObjectURL").mockReturnValue("blob:preview"));
    const revokeObjectURL = spies.use(spyOn(URL, "revokeObjectURL"));
    const { result, unmount } = renderHook(() => useFile("file", { mimeTypes }));
    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([png])));

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  test("error - too big", () => {
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1, mimeTypes }));

    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([bigPng])));

    expect(result.current.state).toEqual(UseFileState.error);
    expect(result.current.isIdle).toEqual(false);
    expect(result.current.isSelected).toEqual(false);
    expect(result.current.isError).toEqual(true);
    expect(result.current.data).toEqual(null);
  });

  test("error - invalid mime", () => {
    const { result } = renderHook(() => useFile("file", { maxSizeBytes: 1, mimeTypes }));

    act(() => result.current.actions.selectFile(mocks.fileChangeEvent([jpeg])));

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
              onChange={file.actions.selectFile}
              type="file"
              {...file.input.props}
            />
          </label>

          {file.isSelected && <output>{file.data.name}</output>}

          <button onClick={file.actions.clearFile} type="button">
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
