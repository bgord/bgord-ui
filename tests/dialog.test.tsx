import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../src/components/dialog";
import * as hooks from "../src/hooks";

function Testcase(props: {
  defaultValue?: boolean;
  locked?: boolean;
  onCancel?: React.ReactEventHandler<HTMLDialogElement>;
}) {
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
      <Dialog {...toggle} data-testid="dialog" locked={locked} onCancel={props.onCancel} />
    </>
  );
}

afterEach(() => cleanup());

describe("Dialog component", () => {
  test("open", () => {
    render(<Testcase defaultValue={true} />);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
  });

  test("close", async () => {
    render(<Testcase defaultValue={true} />);

    fireEvent.click(screen.getByText("Close"));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - ESC", async () => {
    render(<Testcase defaultValue={true} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - ESC - locked", async () => {
    render(<Testcase defaultValue={true} locked={true} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("close - ESC - onCancel", () => {
    const onCancel = jest.fn();
    render(<Testcase defaultValue={true} onCancel={onCancel} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - ESC - onCancel - preventDefault", () => {
    render(<Testcase defaultValue={true} onCancel={(event) => event.preventDefault()} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("close - click outside", async () => {
    render(<Testcase defaultValue={true} />);

    fireEvent.mouseDown(document.body);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - click outside - locked", async () => {
    render(<Testcase defaultValue={true} locked={true} />);

    fireEvent.mouseDown(document.body);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("body scroll lock", async () => {
    render(<Testcase defaultValue={true} />);

    expect(document.body.style.overflow).toEqual("hidden");

    fireEvent.click(screen.getByText("Close"));

    expect(document.body.style.overflow).toEqual("");
  });
});
