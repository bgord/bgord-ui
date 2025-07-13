import { describe, expect, jest, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { useExitAction } from "../src/hooks/use-exit-action";

function fakeMouseEvent(): any {
  return { preventDefault: jest.fn() } as unknown as React.MouseEvent;
}
function fakeAnimEvent(name: string): any {
  return { animationName: name } as unknown as React.AnimationEvent;
}

const ANIMATION = "fadeSlideUp";

describe("useExitAction()", () => {
  test("starts in 'idle': visible=true and no attach props", () => {
    const actionFn = jest.fn();
    const { result } = renderHook(() => useExitAction({ actionFn, animation: ANIMATION }));

    expect(result.current.visible).toBe(true);
    expect(result.current.attach).toBeUndefined();
  });

  test("moves to 'exiting' after trigger() and sets attach props", () => {
    const actionFn = jest.fn();
    const { result } = renderHook(() => useExitAction({ actionFn, animation: ANIMATION }));

    act(() => result.current.trigger(fakeMouseEvent()));

    expect(result.current.visible).toBe(true);
    expect(result.current.attach).toMatchObject({
      "data-animation": ANIMATION,
      onAnimationEnd: expect.any(Function),
    });
  });

  test("ignores unrelated animation names", () => {
    const actionFn = jest.fn();
    const { result } = renderHook(() => useExitAction({ actionFn, animation: ANIMATION }));

    act(() => result.current.trigger(fakeMouseEvent()));
    act(() => result.current.attach?.onAnimationEnd(fakeAnimEvent("otherAnim")));

    expect(actionFn).not.toHaveBeenCalled();
    expect(result.current.visible).toBe(true); // still on screen
  });

  test("calls actionFn and hides element after the matching animation ends", () => {
    const actionFn = jest.fn();
    const { result } = renderHook(() => useExitAction({ actionFn, animation: ANIMATION }));

    act(() => result.current.trigger(fakeMouseEvent()));
    act(() => result.current.attach?.onAnimationEnd(fakeAnimEvent(ANIMATION)));

    expect(actionFn).toHaveBeenCalledTimes(1);
    expect(result.current.visible).toBe(false);
    expect(result.current.attach).toBeUndefined();
  });

  test("does not re-trigger once exiting", () => {
    const actionFn = jest.fn();
    const { result } = renderHook(() => useExitAction({ actionFn, animation: ANIMATION }));

    act(() => result.current.trigger(fakeMouseEvent())); // first click
    act(() => result.current.trigger(fakeMouseEvent())); // second click

    // still exiting, not gone yet
    expect(result.current.visible).toBe(true);
    expect(actionFn).not.toHaveBeenCalled();
  });

  test("works inside a real component: click → animate → removed", () => {
    const actionFn = jest.fn();

    function Card() {
      const { visible, attach, trigger } = useExitAction({ actionFn, animation: ANIMATION });

      if (!visible) return null;

      return (
        <div data-testid="card" {...attach}>
          <button type="button" onClick={trigger}>
            Delete
          </button>
        </div>
      );
    }

    render(<Card />);

    expect(screen.getByTestId("card")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByTestId("card")).toBeInTheDocument();

    fireEvent.animationEnd(screen.getByTestId("card"), { animationName: ANIMATION });

    expect(actionFn).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card")).toBeNull();
  });
});
