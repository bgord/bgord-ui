import { afterEach, beforeAll, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../src/components/dialog";
import * as hooks from "../src/hooks";

const showSpy = jest.fn();
const closeSpy = jest.fn();

beforeAll(() => {
  Object.assign(HTMLDialogElement.prototype, { showModal: showSpy, close: closeSpy });
});

function Testcase(props: { defaultValue?: boolean }) {
  const defaultValue = props.defaultValue ?? false;
  const toggle = hooks.useToggle({ name: "demo", defaultValue });

  return (
    <>
      <button type="button" onClick={toggle.enable}>
        Open
      </button>
      <button type="button" onClick={toggle.disable}>
        Close
      </button>
      <Dialog {...toggle} data-testid="dialog" />
    </>
  );
}
afterEach(() => {
  cleanup();
  showSpy.mockClear();
  closeSpy.mockClear();
});

describe("Dialog component", () => {
  test("open", () => {
    render(<Testcase defaultValue={true} />);
    expect(showSpy).toHaveBeenCalledTimes(1);
  });

  test("close", async () => {
    render(<Testcase defaultValue={true} />);

    fireEvent.click(screen.getByText("Close"));

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("dialog").dataset.disp).toEqual("none");
  });

  test("close - ESC", async () => {
    const { getByTestId } = render(<Testcase defaultValue={true} />);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(getByTestId("dialog").dataset.disp).toEqual("none");
  });

  test("close - click outside", async () => {
    render(<Testcase defaultValue={true} />);
    fireEvent.mouseDown(document.body);

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("dialog").dataset.disp).toEqual("none");
  });

  test("body scroll lock", async () => {
    render(<Testcase defaultValue={true} />);

    expect(document.body.style.overflow).toEqual("hidden");

    fireEvent.click(screen.getByText("Close"));
    expect(document.body.style.overflow).toEqual("");
  });
});
