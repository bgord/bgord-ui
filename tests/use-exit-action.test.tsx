import { describe, expect, jest, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type React from "react";
import { useExitAction } from "../src/hooks/use-exit-action";

function mouseEvent(): any {
  return { preventDefault: jest.fn() } as unknown as React.MouseEvent;
}

function animationEvent(name: string): any {
  return { animationName: name } as unknown as React.AnimationEvent;
}

const animation = "fade";

describe("useExitAction", () => {
  test("idle", () => {
    const action = jest.fn();
    const { result } = renderHook(() => useExitAction({ action, animation }));

    expect(result.current.visible).toEqual(true);
    expect(result.current.attach).toEqual(undefined);
    expect(action).not.toHaveBeenCalled();
  });

  test("exitting", () => {
    const action = jest.fn();
    const { result } = renderHook(() => useExitAction({ action, animation }));

    act(() => result.current.trigger(mouseEvent()));

    expect(result.current.visible).toEqual(true);
    expect(result.current.attach).toMatchObject({
      "data-animation": animation,
      onAnimationEnd: expect.any(Function),
    });
    expect(action).not.toHaveBeenCalled();
  });

  test("gone", async () => {
    const action = jest.fn();
    const { result } = renderHook(() => useExitAction({ action, animation }));

    act(() => result.current.trigger(mouseEvent()));
    await act(async () => result.current.attach?.onAnimationEnd(animationEvent(animation)));

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.visible).toEqual(false);
    expect(result.current.attach).toEqual(undefined);
  });

  test("ignores unrelated animations", async () => {
    const action = jest.fn();
    const { result } = renderHook(() => useExitAction({ action, animation }));

    act(() => result.current.trigger(mouseEvent()));
    await act(async () => result.current.attach?.onAnimationEnd(animationEvent("unrelated")));

    expect(action).not.toHaveBeenCalled();
    expect(result.current.visible).toEqual(true);
  });

  test("runs only once", async () => {
    const action = jest.fn();
    const { result } = renderHook(() => useExitAction({ action, animation }));

    act(() => result.current.trigger(mouseEvent()));
    await act(async () => result.current.attach?.onAnimationEnd(animationEvent(animation)));
    act(() => result.current.trigger(mouseEvent()));
    await act(async () => result.current.attach?.onAnimationEnd(animationEvent(animation)));

    expect(result.current.visible).toEqual(false);
    expect(action).toHaveBeenCalledTimes(1);
  });

  test("integration", () => {
    const action = jest.fn();

    function Card() {
      const exit = useExitAction({ action, animation });

      if (!exit.visible) return null;

      return (
        <div data-testid="card" {...exit.attach}>
          <button type="button" onClick={exit.trigger}>
            Delete
          </button>
        </div>
      );
    }

    render(<Card />);

    const card = screen.getByTestId("card");

    expect(card).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    expect(card).toBeInTheDocument();

    fireEvent.animationEnd(card, { animationName: animation });

    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card")).toEqual(null);
  });
});
