import { describe, expect, jest, spyOn, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../src/components/dialog";
import { useToggle } from "../src/hooks";

function Testcase(props: { locked?: boolean; onCancel?: React.ReactEventHandler<HTMLDialogElement> }) {
  const toggle = useToggle({ name: "demo", defaultValue: true });

  return (
    <>
      <button onClick={toggle.disable} type="button">
        Close
      </button>
      <Dialog {...toggle} data-testid="dialog" locked={props.locked} onCancel={props.onCancel} />
    </>
  );
}

describe("Dialog", () => {
  test("open", () => {
    render(<Testcase />);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
  });

  test("open - focus", () => {
    render(<Testcase />);

    expect(document.activeElement).toBe(screen.getByTestId("dialog"));
  });

  test("close", () => {
    render(<Testcase />);

    fireEvent.click(screen.getByText("Close"));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - coarse pointer", () => {
    using _ = spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    render(<Testcase />);
    screen.getByText("Close").focus();

    fireEvent.click(screen.getByText("Close"));

    expect(document.activeElement).toBe(document.body);
  });

  test("close - fine pointer", () => {
    using _ = spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    render(<Testcase />);
    screen.getByText("Close").focus();

    fireEvent.click(screen.getByText("Close"));

    expect(document.activeElement).toBe(screen.getByText("Close"));
  });

  test("close - ESC", () => {
    render(<Testcase />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - ESC - locked", () => {
    render(<Testcase locked={true} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("close - ESC - onCancel", () => {
    const onCancel = jest.fn();
    render(<Testcase onCancel={onCancel} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - ESC - onCancel - preventDefault", () => {
    render(<Testcase onCancel={(event) => event.preventDefault()} />);

    fireEvent(screen.getByTestId("dialog"), new Event("cancel", { cancelable: true }));

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("close - click outside", () => {
    render(<Testcase />);

    fireEvent.mouseDown(document.body);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(false);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("none");
  });

  test("close - click outside - locked", () => {
    render(<Testcase locked={true} />);

    fireEvent.mouseDown(document.body);

    expect(screen.getByTestId<HTMLDialogElement>("dialog").open).toEqual(true);
    expect(screen.getByTestId("dialog").getAttribute("data-disp")).toEqual("flex");
  });

  test("body scroll lock", () => {
    render(<Testcase />);

    expect(document.body.style.overflow).toEqual("hidden");
  });

  test("body scroll lock - close", () => {
    render(<Testcase />);

    fireEvent.click(screen.getByText("Close"));

    expect(document.body.style.overflow).toEqual("");
  });
});
