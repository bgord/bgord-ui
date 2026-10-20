import { describe, expect, jest, spyOn, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { useSwipeDismiss } from "../src/hooks/use-swipe-dismiss";

function Sheet(props: { onDismiss: () => void; enabled?: boolean }) {
  const swipe = useSwipeDismiss(props);

  return (
    <dialog data-testid="sheet" open>
      <div data-testid="handle" {...swipe} />
    </dialog>
  );
}

describe("useSwipeDismiss", () => {
  test("follows the pointer", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });

    expect(sheet.style.translate).toEqual("0 60px");
  });

  test("ignores dragging up", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 40 });

    expect(sheet.style.translate).toEqual("0 0px");
  });

  test("dismisses past the threshold", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 260 });
    now.mockReturnValue(1000);
    fireEvent.pointerUp(handle, { clientY: 260 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toEqual("");
  });

  test("dismisses on a flick", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    Object.defineProperty(screen.getByTestId("sheet"), "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    now.mockReturnValue(50);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("springs back below the threshold", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    now.mockReturnValue(1000);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
  });

  test("springs back on cancel", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 300 });
    fireEvent.pointerCancel(handle);

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
  });

  test("animates out before dismissing", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 260 });
    now.mockReturnValue(1000);
    fireEvent.pointerUp(handle, { clientY: 260 });

    expect(sheet.style.translate).toEqual("0 100%");
    expect(onDismiss).toHaveBeenCalledTimes(0);

    const [animation] = sheet.getAnimations();
    animation?.finish();
    await animation?.finished;

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toEqual("");
  });

  test("animates back before resetting", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    now.mockReturnValue(1000);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(sheet.style.translate).toEqual("0 0px");

    const [animation] = sheet.getAnimations();
    animation?.finish();
    await animation?.finished;

    expect(sheet.style.translate).toEqual("");
    expect(sheet.style.transition).toEqual("");
    expect(onDismiss).toHaveBeenCalledTimes(0);
  });

  test("animation cancelled by a new drag", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 260 });
    now.mockReturnValue(1000);
    fireEvent.pointerUp(handle, { clientY: 260 });
    const [animation] = sheet.getAnimations();

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });

    expect(animation?.playState).toEqual("idle");
    expect(onDismiss).toHaveBeenCalledTimes(0);
  });

  test("disabled", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    const now = spies.use(spyOn(performance, "now").mockReturnValue(0));
    const onDismiss = jest.fn();
    render(<Sheet enabled={false} onDismiss={onDismiss} />);
    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 300 });
    now.mockReturnValue(50);
    fireEvent.pointerUp(handle, { clientY: 300 });

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
    expect(handle.style.touchAction).toEqual("");
  });

  test("enabled - handle style", () => {
    using spies = new DisposableStack();
    spies.use(spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList));
    spies.use(spyOn(performance, "now").mockReturnValue(0));
    render(<Sheet onDismiss={jest.fn()} />);
    Object.defineProperty(screen.getByTestId("sheet"), "offsetHeight", { value: 400 });
    const handle = screen.getByTestId("handle");

    expect(handle.style.touchAction).toEqual("none");
    expect(handle.style.userSelect).toEqual("none");
  });
});
