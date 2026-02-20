import { afterEach, beforeAll, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../src/components/dialog";
import * as hooks from "../src/hooks";

const showSpy = jest.fn();
const closeSpy = jest.fn();

function Testcase(props: { defaultValue?: boolean; locked?: boolean }) {
  const defaultValue = props.defaultValue ?? false;
  const locked = props.locked ?? false;
  const toggle = hooks.useToggle({ name: "demo", defaultValue });

  return (
    <>
      <button onClick={toggle.enable} type="button">
        Open
      </button>
      <button onClick={toggle.disable} type="button">
        Close
      </button>
      <Dialog {...toggle} data-testid="dialog" locked={locked} />
    </>
  );
}

beforeAll(() => {
  Object.assign(HTMLDialogElement.prototype, { showModal: showSpy, close: closeSpy });
});

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

  test("close - ESC - locked", async () => {
    const { getByTestId } = render(<Testcase defaultValue={true} locked={true} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(closeSpy).toHaveBeenCalledTimes(0);
    expect(getByTestId("dialog").dataset.disp).toEqual("flex");
  });

  test("close - click outside", async () => {
    render(<Testcase defaultValue={true} />);

    fireEvent.mouseDown(document.body);

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("dialog").dataset.disp).toEqual("none");
  });

  test("close - click outside - locked", async () => {
    render(<Testcase defaultValue={true} locked={true} />);

    fireEvent.mouseDown(document.body);

    expect(closeSpy).toHaveBeenCalledTimes(0);
    expect(screen.getByTestId("dialog").dataset.disp).toEqual("flex");
  });

  test("body scroll lock", async () => {
    render(<Testcase defaultValue={true} />);

    expect(document.body.style.overflow).toEqual("hidden");

    fireEvent.click(screen.getByText("Close"));

    expect(document.body.style.overflow).toEqual("");
  });
});
